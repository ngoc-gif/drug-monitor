// middleware/validateDrug.js

module.exports = (req, res, next) => {
  const { name, card, pack, perDay, dosage } = req.body;

  // Hàm helper để trả lỗi
  const sendError = (message) => {
    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(400).json({ error: "Validation Error", message });
    }
    return res.status(400).render("error", { message, title: "Validation Error" });
  };

  // 1. Kiểm tra tên thuốc
  if (!name || name.trim().length <= 5) {
    return sendError("Drug name must be more than 5 characters long");
  }

  // 2. Kiểm tra card > 1000
  if (!card || isNaN(card) || Number(card) <= 1000) {
    return sendError("Card must be more than 1000");
  }

  // 3. Kiểm tra pack > 0
  if (!pack || isNaN(pack) || Number(pack) <= 0) {
    return sendError("Pack must be more than 0");
  }

  // 4. Kiểm tra perDay > 0 và < 90
  if (!perDay || isNaN(perDay) || Number(perDay) <= 0 || Number(perDay) >= 90) {
    return sendError("PerDay must be more than 0 and less than 90");
  }

  // 5. Kiểm tra dosage format: XX-morning,XX-afternoon,XX-night
  const dosagePattern = /^\d+-morning,\d+-afternoon,\d+-night$/;
  if (!dosage || !dosagePattern.test(dosage)) {
    return sendError("Dosage must follow format: XX-morning,XX-afternoon,XX-night (X is digit)");
  }

  // Nếu hợp lệ thì cho qua
  next();
};
