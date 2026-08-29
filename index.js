const fs = require("fs");
const readlineSync = require("readline-sync");

const db_file = "./db.json";
const ROLES = ["PRODUCER", "FINANCE", "CREATOR", "EDITOR"];

function loadDB() {
  const data = fs.readFileSync(db_file, "utf-8");
  return JSON.parse(data);
}

function saveDB(data) {
  fs.writeFileSync(db_file, JSON.stringify(data, null, 2), "utf-8");
}

function pause() {
  console.log("");
  readlineSync.keyIn("Press any key to back to main menu...", {
    hideEchoBack: true,
    mask: ""
  });
}

function findMember(db, id) {
  for (let i = 0; i < db.members.length; i++) {
    // console.log(id, db.members[i].name, db.members[i].id)
    if (db.members[i].id === id) {
      return db.members[i];
    }
  }
  return null;
}

function findRequest(db, id) {
  for (let i = 0; i < db.role_change_requests.length; i++) {
    if (db.role_change_requests[i].id === id) {
      return db.role_change_requests[i];
    }
  }
  return null;
}

function getVotes(db, requestId) {
  return db.decisions.filter(function (data) {
    return data.request_id === requestId;
  });
}

function countVote(db, requestId, result) {
  return getVotes(db, requestId).filter(function (data) {
    return data.result === result;
  }).length;
}

function hasActiveRequest(db, targetId) {
  for (let i = 0; i < db.role_change_requests.length; i++) {
    const request = db.role_change_requests[i];
    if (request.target_id === targetId && request.status === "PENDING") {
      return true;
    }
  }
  return false;
}

function newRequest(db) {
  let max = 0;
  for (let i = 0; i < db.role_change_requests.length; i++) {
    const n = parseInt(db.role_change_requests[i].id.replace("C", ""));
    if (n > max) max = n;
  }
  return "C" + String(max + 1).padStart(2, "0");
}

function whoami(db) {
  console.log("");
  showMemberList(db);
  const id = readlineSync.question("whoami (enter member id): ").trim().toUpperCase();
  const me = findMember(db, id);
  if (me === null) {
    console.log("ERROR: member not found.");
    return null;
  }
  console.log("Hi " + me.name + "(" + me.role + ")");
  return me;
}

// mem List

function showMemberList(db) {
  console.log("=== Member List ===");
  console.log("ID  | NAME              | ROLE   | STATUS");
  for (let i = 0; i < db.members.length; i++) {
    const m = db.members[i];
    const status = m.active ? "ACTIVE" : "INACTIVE";
    console.log(
      m.id.padEnd(4) + " | " + m.name.padEnd(20) + " | " + m.role.padEnd(9) + " | " + status
    );
  }
  console.log("===================");
}

function menuMemberList() {
  const db = loadDB();
  console.log("");
  showMemberList(db);
  pause();
}

// request

function menuRequest() {
  const db = loadDB();

  const me = whoami(db);
  if (me === null) {
    pause();
    return;
  }

  const targetId = readlineSync.question("Select member (member id): ").trim().toUpperCase();
  const target = findMember(db, targetId);

  if (target === null) {
    console.log("ERROR: member not found");
    pause();
    return;
  }

  if (target.id === me.id) {
    console.log("ERROR: cant change self role");
    pause();
    return;
  }

  if (hasActiveRequest(db, target.id)) {
    console.log("ERROR: theres active request for this user");
    pause();
    return;
  }

  console.log("");
  const index = readlineSync.keyInSelect(ROLES, "select role: ");
  if (index === -1) {
    console.log("cancel");
    pause();
    return;
  }

  const newRole = ROLES[index];

  if (newRole === target.role) {
    console.log("ERROR: member is already have that role")
    pause();
    return;
  }

  const request = {
    id: newRequest(db),
    requester_id: me.id,
    target_id: target.id,
    new_role: newRole,
    status: "PENDING"
  };

  db.role_change_requests.push(request);
  saveDB(db);

  console.log("");
  console.log("request created !");
  console.log("request id: " + request.id);
  console.log("target: " + target.name + " (" + target.role + ")");
  console.log("new role: " + newRole);
  console.log("status: PENDING");
  pause();
}

// vote

function showRequestLine(db, r) {
  const requester = findMember(db, r.requester_id);
  const target = findMember(db, r.target_id);
  const approve = countVote(db, r.id, "APPROVE");
  const reject = countVote(db, r.id, "REJECT");
  return (
    r.id + " | by " + requester.name + " change " + target.name + " to " + r.new_role + " approve " + approve + " reject " + reject
  );
}

function menuVote() {
  const db = loadDB();

  const me = whoami(db);
  if (me === null) {
    pause();
    return;
  }

  if (me.active === false) {
    console.log("ERORR: user is not active");
    pause();
    return;
  }

  const pending = db.role_change_requests.filter(function (request) {
    return request.status === "PENDING";
  });

  console.log("")
  console.log("=== CURRENT VOTE ===");
  if (pending.length === 0) {
    console.log("theres no current vote");
  } else {
    for (let i = 0; i < pending.length; i++) {
      console.log(showRequestLine(db, pending[i]));
    }
  }

  const myRequests = db.role_change_requests.filter(function (request) {
    return request.requester_id === me.id;
  });

  console.log("");
  console.log("=== my request ===");
  if (myRequests.length === 0) {
    console.log("no request");
  } else {
    for (let i = 0; i < myRequests.length; i++) {
      console.log(showRequestLine(db, myRequests[i]));
    }
  }

  console.log("");
  const action = readlineSync.keyInSelect(["vote", "cancel request"], "action: ");

  if (action === -1) {
    console.log("back to home");
    pause();
    return;
  }

  if (action === 1) {
    cancelRequest(db, me);
    return;
  }

  const requestId = readlineSync.question("select request id: ").trim().toUpperCase();
  const request = findRequest(db, requestId);

  if (request === null) {
    console.log("ERROR: no request id found");
    pause();
    return;
  }

  if (request.status !== "PENDING") {
    console.log("ERROR: this request (" + request.status + ") cant vote");
    pause();
    return;
  }

  if (request.target_id === me.id) {
    console.log("ERROR: cant vote self");
    pause();
    return;
  }

  const votes = getVotes(db, request.id);
  for (let i = 0; i < votes.length; i++) {
    if (votes[i].member_id === me.id) {
      console.log("ERROR: already vote");
      pause();
      return;
    }
  }

  console.log("");
  const choice = readlineSync.keyInSelect(["APPROVE", "REJECT"], "vote: ");
  if (choice === -1) {
    console.log("cancel");
    pause();
    return;
  }
  const result = choice === 0 ? "APPROVE" : "REJECT";

  db.decisions.push({
    request_id: request.id,
    member_id: me.id,
    result: result
  });

  console.log("");
  console.log("voted '" + result + "' for request '" + request.id + "'");

  const approve = countVote(db, request.id, "APPROVE");
  const reject = countVote(db, request.id, "REJECT");
  console.log("current approve = " + approve + ", reject = " + reject);

  if (approve >= 2) {
    request.status = "APPROVED";
    const target = findMember(db, request.target_id);
    const oldRole = target.role;
    target.role = request.new_role;
    console.log("")
    console.log("requrst " + request.id + " approved");
    console.log(target.name + " change role from " + oldRole + " to " + target.role);
  } else if (reject >= 2) {
    request.status = "REJECTED";
    console.log("");
    console.log("request " + request.id + " have been rejected");
  }

  saveDB(db);
  pause();
}

// cancel

function cancelRequest(db, me) {
  const requestId = readlineSync.question("select request id: ").trim().toUpperCase();
  const request = findRequest(db, requestId);

  if (request === null) {
    console.log("ERROR: no request id found");
    pause();
    return;
  }

  if (request.requester_id !== me.id) {
    console.log("ERROR: can cancel only own request");
    pause();
    return;
  }

  if (request.status !== "PENDING") {
    console.log("ERROR: this request " + request.status + " already cant edit/cancel");
    pause();
    return;
  }

  if (getVotes(db, request.id).length > 0) {
    console.log("ERROR: theres vote on request cant cancel");
    pause();
    return;
  }

  request.status = "CANCELLED";
  saveDB(db);
  console.log("");
  console.log("Cancelled " + request.id);
  pause();
}

// history

function menuHistory() {
  const db = loadDB();

  console.log("");
  showMemberList(db);

  console.log("");
  console.log("=== HISTORY ===");
  for (let i = 0; i < db.role_change_requests.length; i++) {
    const r = db.role_change_requests[i];
    console.log(showRequestLine(db, r));

    if (r.status !== "CANCELLED") {
      const votes = getVotes(db, r.id);
      if (votes.length === 0) {
        console.log(" vote : (no vote yet)");
      } else {
        for (let j = 0; j < votes.length; j++) {
          const voter = findMember(db, votes[j].member_id);
          console.log(" vote: " + voter.name + " -> " + votes[j].result);
        }
      }
    }
  }
  console.log("");
  console.log("===============");
  pause();
}

// main

function main() {
  while (true) {
    console.log("")
    console.log("======== MAIN MENU ========");
    console.log("1. member list");
    console.log("2. role change request");
    console.log("3. vote");
    console.log("4. history");
    console.log("0. exit");
    console.log("===========================");

    const choice = readlineSync.question("select menu: ").trim();

    if (choice === "1") {
      menuMemberList();
    } else if (choice === "2") {
      menuRequest();
    } else if (choice === "3") {
      menuVote();
    } else if (choice === "4") {
      menuHistory();
    } else if (choice === "0") {
      console.log("byeee!")
      break;
    } else {
      console.log("ERROR: menu not found")
    }
  }
}

main();
