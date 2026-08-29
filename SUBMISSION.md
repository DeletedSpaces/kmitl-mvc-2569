# SUBMISSION - Exit Exam MVC 1/2569 (เสาร์บ่าย)

## 1. วิธีเปิดโปรแกรม
- Node.js
- node index.js
- โปรแกรมสร้างมากากอย่าเทสอะไรแปลกๆ

## 2. ตารางเชื่อมโยง Requirements

| Requirement | Model / Domain | Controller / Action | View / Screen |
|---|---|---|---|
| R1 | index.js -> loadDB(), saveDB() | index.js -> main() | index.js -> showMainMenu(), pause() |
| R1 Select User | findMember(id) | whoami() | whoami() |
| R2.1 Show Name Role Status | db.members | showMemberList() | showMemberList() |
| R2.2 Create Request | newRequest(), db.role_change_requests.push(request), ROLES | menuRequest() | menuRequest() |
| R2.3 requester != target | if (target.id === me.id) | menuRequest() | menuRequest() |
| R2.4 1 target have only 1 pending | hasActiveRequest(db, target.id) | menuRequest() | menuRequest() |
| R3.1 active and not requester/target | if (me.active === false), if (request.target_id === me.id), if (request.requester_id === me.id) | menuVote() | menuVote() |
| R3.2 vote approve/reject once per request | db.decisions.push(), getVotes(db, request.id) | menuVote() | menuVote() |
| R3.3 reject with reason | if checks in menuVote() | menuVote() | console.log("ERROR: ...") |
| R4.1 approve >= 2 -> APPROVED + change role | countVote(db, id, "APPROVE"), request.status = "APPROVED", target.role = request.new_role | menuVote() | menuVote() |
| R4.2 reject >= 2 -> REJECTED | countVote(db, id, "REJECT"), request.status = "REJECTED" | menuVote() | menuVote() |
| R4.3 finished request cant vote/edit | if (request.status !== "PENDING") | menuVote(), cancelRequest() | menuVote(), cancelRequest() |
| R4.4 keep data for audit | db.role_change_requests, db.decisions | menuHistory() | menuHistory() |
| R5.1 cancel own pending request with no vote | if (request.requester_id !== me.id), if (request.status !== "PENDING"), getVotes().length > 0 | cancelRequest() | cancelRequest() |
| R5.2 summary by status + vote count + current role | countVote(), db.role_change_requests | menuHistory() | menuHistory(), showRequestLine(), showMemberList() |
| R5.3 show error reason | all if checks | menuRequest(), menuVote(), cancelRequest() | console.log("ERROR: ...") |

## 3. ผลการทดสอบ

| กรณี | ผ่าน/ไม่ผ่าน | หมายเหตุ (เฉพาะที่จำเป็น) |
|---|---|---|
| T1 | ผ่าน | |
| T2 | ผ่าน | |
| T3 | ผ่าน | |
| T4 | ผ่าน | |
| T5 | ผ่าน | |
| T6 | ผ่าน | |

## 4. ความแตกต่างระหว่างแบบที่ออกกับโปรแกรมจริง (ถ้ามี)
ระบุไม่เกิน 3 ข้อ

## 5. บันทึกการใช้ Generative AI
หากไม่ได้ใช้ ให้ระบุ **ไม่ได้ใช้ Generative AI**

| เวลาโดยประมาณ | เครื่องมือ | ใช้เพื่ออะไร | นำคำแนะนำไปใช้อย่างไร |
|---|---|---|---|
| 13.39 | Claude | ให้ AI ช่วยวิเคราะห์ requirement | อ่านและทำความเข้าใจ |
| 13.45 | Claude | ถาม requirement ที่ไม่เข้าใจ คือตัวเป้าหมายกับคนสร้างโวทไม่ได้| เข้าใจแล้ว |
| 13.51 | Claude | คิด flow แล้วให้ AI ช่วยเช็ค | ปรับแก้ตามที่ AI เห็นว่ายังไม่ครบ |
| 13.52 | Claude | Feedback flow ที่แก้ไข | ปรับแก้ตามที่ AI เห็นว่ายังไม่ครบ |
| 14.03 | Claude | Feedback flow ที่แก้ไข | ปรับแก้ตามที่ AI เห็นว่ายังไม่ครบ |
| 14.10 | Claude | Feedback flow ที่แก้ไข | ปรับแก้ตามที่ AI เห็นว่ายังไม่ครบ |
| 14.11 | Claude | Feedback flow ที่แก้ไข | ปรับแก้ตามที่ AI เห็นว่ายังไม่ครบ |
| 14.11 | Claude | สรุป requirement ที่ feedback ข้อดีข้อเสีย | ai เห็นว่าโอเคไม่ต้องปรับ flow แล้ว |
| 14.12 | Claude | ถามว่าจะใช้ stack อะไรดี | ใช้ nodejs / readline / database json |
| 14.31 | Claude | ให้ ai ตรวจ final code | ปรับแก้บัค |
