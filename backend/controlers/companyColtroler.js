import { CompanyModel } from "../Model/companyModel.js";

export const getAllCompanies = async (req, res) => {
  try {
    const {
      dateFrom,
      dateTo,
      searchValue,
      sortFIeld,
      sortDirection,
      limit = 10,
      offset = 0,
    } = req.query;
    let query = {isDeleted:false};
    if (dateFrom && dateTo) {
      query.createdAt = {
        $gte: new Date(dateFrom),
        $lte: new Date(dateTo + "T23:59:59.999Z"),
      };
    }
if (searchValue) {
  query.$or = [
    { company_name: { $regex: searchValue, $options: "i" } },
    { owner_name: { $regex: searchValue, $options: "i" } },
    { email: { $regex: searchValue, $options: "i" } },
    { contact_no: { $regex: searchValue, $options: "i" } },
    { city: { $regex: searchValue, $options: "i" } },
    { state: { $regex: searchValue, $options: "i" } },
    { country: { $regex: searchValue, $options: "i" } },
  ];
}
    let mongoQuery = CompanyModel.find(query);
    if (sortFIeld) {
      mongoQuery = mongoQuery.sort({
        [sortFIeld]: sortDirection === "asc" ? 1 : -1,
      });
    }
    const companies = await mongoQuery
      .skip(Number(offset)) 
      .limit(Number(limit));
    const totalCount = await CompanyModel.countDocuments(query);
    res.status(200).json({
      status: "success",
      data: {
        length: totalCount,
        companies,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};

export const getCompanybyID = async (req, res) => {
  try {
    const id = req.params.id;
    const fetchCompany = await CompanyModel.findById(id);
    res.status(200).json({
      status: "success",
      data: {
        length: fetchCompany.length,
        fetchCompany,
        msg: "data get poperly",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      msg: err.message,
    });
  }
};
export const createCompany = async (req, res) => {
  try {
    const company = await CompanyModel.create(req.body);
    res.status(201).json({
      status: "Success",
      data: {
        company,
        status: 201,
        msg: "company Created SucessFully",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};
export const updateCompany = async (req, res) => {
  try {
    const id = req.params.id;
    const updateCompany = await CompanyModel.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: "success",
      data: {
        updateCompany,
        status: 201,
        msg: "data get poperly",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const id = req.params.id;
    const getByid = await CompanyModel.findById(id);
    if (!getByid) {
      res.status(200).json({
        status: "success",
        data: {
          msg: "data Not Found",
        },
      });
      return;
    }

    await CompanyModel.findByIdAndUpdate(id, 
        {
        $set: {
          "isDeleted": true,
        },
      },
    );
    res.status(200).json({
      status: "success",
      data: {
        deleteCompany,
        status: 201,
        msg: "data delete poperly",
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 400,
      msg: err.message,
    });
  }
};
