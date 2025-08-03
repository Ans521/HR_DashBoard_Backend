import type { Request, Response } from "express";
import { Candidate } from "../models/Candidate.js";
import { User } from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validEditEmployeeData } from "../middleware/checkData.js";
import { Leave } from "../models/Leave.js";

const secretKey = "soiskfdlsfq2931i20jk";

export const getAttendance = async (req: Request, res: Response) => {
    try {
        const employees = await Candidate.find({ status: "selected" });

        if (!employees || employees.length === 0) {
            return res.json({ message: "No employees to show in attendance" });
        }

        res.status(200).json({
            message: "Fetched attendance data successfully",
            data: employees,
        });
    } catch (err: any) {
        res.status(400).json({
            message: "Error in fetching employees attendance",
            error: err.message,
        });
    }
};

export const updateAttendanceStatus = async (req: Request, res: Response) => {
    try {
        const { status, employeeId } = req.params;

        const allowedStatus = [
            "present",
            "absent",
            "medical leave",
            "work from home",
        ];
        if (!status || !employeeId) throw new Error("Invalid request");

        if (!allowedStatus.includes(status)) {
            throw new Error("Invalid status");
        }

        const updatedEmployee = await Candidate.findByIdAndUpdate(
            employeeId,
            { attendanceStatus: status },
            { new: true, runValidators: true }
        );

        if (!updatedEmployee) {
            throw new Error("Invalid employee");
        }

        res.status(200).json({
            message: `${updatedEmployee.name} attendance updated to ${status}`,
            data: updatedEmployee,
        });
    } catch (err: any) {
        res.status(400).json({
            message: "Error in Updating attendance Status",
            error: err.message,
        });
    }
};

export const signupUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;
        const passwordHash = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: passwordHash });
        const newUser = await user.save();
        const token = jwt.sign({ _id: user.id }, secretKey, { expiresIn: "2h" });
        return res.status(200).cookie('token', token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            expires: new Date(Date.now() + 8 * 3600000),
        }).json(
            {
                message: "User signed up successfully",
                data: newUser,
            }
        )
    } catch (err: any) {
        return res.status(400).send(err.message);
    }
};
const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        const hashedPassword: any = user?.password;
        if (!user || !(await comparePassword(password, hashedPassword))) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ _id: user.id }, secretKey, { expiresIn: "2h" });
        res.status(200).cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            expires: new Date(Date.now() + 8 * 3600000),
        }).json({ message: "User logged in successfully", data: user });
    } catch (err: any) {
        res.status(400).send(err.message);
    }
};

export const checkAuth = async (_req: Request, res: Response) => {
    res.json({ message: "User Authenticated", data: "good" });
};

export const logoutUser = (_req: Request, res: Response) => {
    res.cookie("token", null, { expires: new Date(Date.now()) });
    res.send("Logged Out Successfully");
};


export const addCandidate = async (req: any, res: Response) => {
  try {
    const { name, email, phone, position, experience } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Please Provider Resume" });
    }

    const resumeUrl = `${req.protocol}://${req.get("host")}/api/uploads/${req.file.filename}`;

    const newCandidate = new Candidate({
      name,
      email,
      phone,
      position,
      experience,
      resumeUrl,
    });

    const existingUser = await Candidate.findOne({ email: email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    await newCandidate.save();

    res.status(200).json({
      message: "Saved candidate successfully",
      data: newCandidate,
    });
  } catch (err: any) {
    res.status(400).json({ message: "Error in saving candidate", error: err.message });
  }
};

export const getAllCandidates = async (req: Request, res: Response) => {
  try {
    const candidates = await Candidate.find({ status: { $ne: "selected" } });

    if (candidates.length === 0) {
      return res.json({ message: "No candidates found" });
    }

    res.status(200).json({ message: "Fteched candidates successfully", data: candidates });
  } catch (err: any) {
    res.status(400).json({ message: "Error in fetching candidates", error: err.message });
  }
};

export const updateCandidateStatus = async (req: Request, res: Response) => {
  try {
    const { status, candidateId } = req.params;
    console.log(status, candidateId);
    const allowedStatus = ["selected", "rejected", "ongoing", "new", "scheduled"];

    if(!status || !candidateId) throw new Error("Invalid request");
    if (!allowedStatus.includes(status)) {
      throw new Error("Invalid status");
    }

    const newEmployee = await Candidate.findByIdAndUpdate(
      candidateId,
      { status: status },
      { new: true, runValidators: true }
    );

    if (!newEmployee) {
      throw new Error("Invalid Candidate");
    }

    res.status(200).json({
      message: newEmployee.name + " is " + status,
      data: newEmployee,
    });
  } catch (err: any) {
    res.status(400).json({
      message: "Error in moving candidate to employee",
      error: err.message,
    });
  }
};

export const fetchAllEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await Candidate.find({ status: "selected" });

    if (!employees) {
      return res.json({ message: "No employees to show" });
    }

    res.status(200).json({ message: "Fetched employees successfully", data: employees });
  } catch (err: any) {
    res.status(400).json({
      message: "Error in fetching employees",
      error: err.message,
    });
  }
};

export const updateEmployee = async (req: Request, res: Response) => {
  try {
    if (!validEditEmployeeData(req)) {
      throw new Error("Invalid Data updation");
    }

    const { email } = req.body;
    const employee = await Candidate.findOne({ email });

    if (!employee) {
      return res.status(400).json({
        message: "Employee not found with this Email",
      });
    }

    const updatedEmployee = await Candidate.findByIdAndUpdate(
      employee._id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      message: "Profile updated successfully!",
      data: updatedEmployee,
    });
  } catch (err: any) {
    res.status(400).json({
      message: "Error in updating Employee Data",
      error: err.message,
    });
  }
};

export const deleteEmployee = async (req: Request, res: Response) => {
  try {
    const id = req.params.employeeId;

    const user = await Candidate.findById(id);
    if (!user) {
      throw new Error("Invalid User");
    }

    await Candidate.findByIdAndDelete(id);

    res.status(200).json({
      message: "Deleted User successfully!",
    });
  } catch (err: any) {
    res.status(400).json({
      message: "Error in deleting Employee Data",
      error: err.message,
    });
  }
};
export const createLeave = async (req: Request, res: Response) => {
  try {
    const { name, date, department, reason } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "Document is required" });
    }

    const candidate = await Candidate.findOne({ name, department });

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    if (candidate.attendanceStatus !== "present") {
      return res.status(400).json({
        message: "Leave can only be created for present candidates",
      });
    }

    const document = `${req.protocol}://${req.get("host")}/api/uploads/${req.file.filename}`;

    const newLeave = new Leave({
      name,
      department,
      date,
      reason,
      document,
    });

    await newLeave.save();

    res.status(200).json({
      message: "Leave created successfully",
      data: newLeave,
    });
  } catch (err: any) {
    res.status(400).json({
      message: "Error in creating leave ",
      error: err.message,
    });
  }
};

export const getAllLeaves = async (req: Request, res: Response) => {
  try {
    const leaves = await Leave.find({});

    if (!leaves || leaves.length === 0) {
      return res.send("No leaves Data");
    }

    res.status(200).json({
      message: "Leaves fetched successfully",
      data: leaves,
    });
  } catch (err: any) {
    res.status(400).json({
      message: "Error in fetching leaves ",
      error: err.message,
    });
  }
};

export const updateLeaveStatus = async (req: Request, res: Response) => {
  try {
    const { status, leaveId } = req.params;

    const allowedStatus = ["approved", "rejected", "pending"];
    if(!status || !leaveId) throw new Error("Invalid request");
    if (!allowedStatus.includes(status.toLowerCase())) {
      throw new Error("Invalid status");
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      leaveId,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedLeave) {
      throw new Error("Invalid Leave");
    }

    res.status(200).json({
      message: `${updatedLeave.name} leave updated to ${status}`,
      data: updatedLeave,
    });
  } catch (err: any) {
    res.status(400).json({
      message: "Error in Updating leave Status ",
      error: err.message,
    });
  }
};