import express from "express";
import verifyToken from "../middleware/auth.js";
import { verify } from "crypto";
import { addCandidate, checkAuth, createLeave, deleteEmployee, fetchAllEmployees, getAllCandidates, getAllLeaves, getAttendance, loginUser, logoutUser, signupUser, updateAttendanceStatus, updateCandidateStatus, updateEmployee, updateLeaveStatus } from "../controllers/controller.js";
import upload from "../middleware/uploadResume.js";
import { validCandidateData } from "../middleware/checkData.js";

const router = express.Router();

router.post("/signup", signupUser)
router.post('/login', loginUser)
router.post('/logout', verifyToken, logoutUser)
router.get('/employees/attendance', verifyToken, getAttendance)
router.patch('/employees/attendance/:status/:empId', verifyToken, updateAttendanceStatus)
router.post("/candidates/addCandidate", verifyToken, upload.single("resume"), validCandidateData, addCandidate);
router.get('/candidates', verifyToken, getAllCandidates)
router.patch('/candidates/:status/:candidateId', verifyToken, updateCandidateStatus)
router.get("/employees", verifyToken, fetchAllEmployees);
router.patch("/employees/update", verifyToken, updateEmployee);
router.delete("/employees/delete/:employeeId", verifyToken, deleteEmployee);
router.post("/leave/create", upload.single("document"), verifyToken, createLeave);
router.get("/leaves", verifyToken, getAllLeaves);
router.patch("/leaves/:status/:leaveId", verifyToken, updateLeaveStatus);

export default router;