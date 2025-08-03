import validator from "validator";
export const validCandidateData = (req : any, res : any, next : any) => {
  const { name, email, phone, position, experience } = req.body;

  if (!name || name.trim().length < 2) {
    return res
      .status(400)
      .json({ message: "Name must be at least 2 characters" });
  }

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({ message: "Invalid email address" });
  }

  if (!phone || !validator.isMobilePhone(phone, "any")) {
    return res.status(400).json({ message: "Invalid phone number" });
  }

  if (!position || position.trim().length < 2) {
    return res.status(400).json({ message: "Position is required" });
  }

  if (
    experience &&
    (!validator.isNumeric(experience.toString()) || experience < 0)
  ) {
    return res
      .status(400)
      .json({ message: "Experience must be a non-negative number" });
  }

  next();
};

export const validEditEmployeeData = (req : any) => {
  const allowedFeilds = [
    "name",
    "email",
    "phone",
    "department",
    "position",
    "dateOfJoining",
  ];

  const isValidData = Object.keys(req.body).every((field) =>
    allowedFeilds.includes(field)
  );

  return isValidData;
};

