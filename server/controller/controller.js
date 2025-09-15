let Drugdb = require('../model/model');

// creates and saves a new drug
exports.create = async (req, res) => {
  // validate incoming request
  if (!req.body) { // if content of request (form data) is empty
    return res.status(400).json({ message: "Content cannot be empty!" });
  }

  try {
    // create new drug
    const drug = new Drugdb({
      name: req.body.name,    // take values from form and assign to schema
      card: req.body.card,
      pack: req.body.pack,
      perDay: req.body.perDay,
      dosage: req.body.dosage
    });

    // save created drug to database
    const data = await drug.save();
    console.log(`${data.name} added to the database`);

    // Nếu request là từ web (form HTML) → redirect
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect('/manage');
    }

    // Nếu request từ API (Postman) → trả JSON
    res.status(201).json(data);

  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "Validation Error", details: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ error: "Duplicate Key", details: err.message });
    }
    res.status(500).json({ message: err.message || "There was an error while adding the drug" });
  }
};

// can either retrieve all drugs from the database or retrieve a single drug
exports.find = async (req, res) => {
  try {
    if (req.query.id) { // if we are searching for drug using its ID
      const id = req.query.id;
      const data = await Drugdb.findById(id);

      if (!data) {
        return res.status(404).json({ message: "Can't find drug with id: " + id });
      }

      return res.json(data);
    } else {
      const drugs = await Drugdb.find();
      res.json(drugs);
    }
  } catch (err) {
    res.status(500).json({ message: err.message || "An error occurred while retrieving drug information" });
  }
};

// edits a drug selected using its ID
exports.update = async (req, res) => {
  if (!req.body) {
    return res.status(400).json({ message: "Cannot update with empty data" });
  }

  try {
    const id = req.params.id;
    const data = await Drugdb.findByIdAndUpdate(id, req.body, { useFindAndModify: false, new: true });

    if (!data) {
      return res.status(404).json({ message: `Drug with id: ${id} cannot be updated` });
    }

    // Nếu request từ web (form) → redirect
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect('/manage');
    }

    res.json(data);
  } catch (err) {
    if (err.name === "ValidationError") {
      return res.status(400).json({ error: "Validation Error", details: err.message });
    }
    res.status(500).json({ message: "Error in updating drug information" });
  }
};

// deletes a drug using its ID
exports.delete = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await Drugdb.findByIdAndDelete(id);

    if (!data) {
      return res.status(404).json({ message: `Cannot delete drug with id: ${id}. Please check id` });
    }

    // Nếu request từ web (form) → redirect
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect('/manage');
    }

    res.json({ message: `${data.name} was deleted successfully!` });
  } catch (err) {
    res.status(500).json({ message: "Could not delete Drug with id=" + req.params.id });
  }
};

// =================== Purchase ===================
// render purchase page mặc định 30 ngày
exports.showPurchase = async (req, res) => {
  try {
    const drugs = await Drugdb.find();
    res.render('purchase', { drugs: drugs, days: 30, results: [] });
  } catch (err) {
    res.status(500).json({ message: err.message || "Error while loading purchase page" });
  }
};

// calculate purchase với số ngày nhập vào
exports.calculatePurchase = async (req, res) => {
  try {
    const days = parseInt(req.body.days) || 30;  
    const drugs = await Drugdb.find();

    // Tính toán nhu cầu mua
    const results = drugs.map(drug => {
      const totalNeeded = drug.perDay * days;   // tổng viên cần dùng
      const packs = Math.ceil(totalNeeded / drug.pack);  // số pack cần mua
      const cards = Math.ceil(totalNeeded / drug.card);  // số card cần mua

      return {
        name: drug.name,
        perDay: drug.perDay,
        days,
        totalNeeded,
        packs,
        cards
      };
    });

    res.render('purchase', { 
      drugs: drugs, 
      days: days,
      results: results
    });

  } catch (err) {
    res.status(500).json({ message: err.message || "Error while calculating purchase" });
  }
};