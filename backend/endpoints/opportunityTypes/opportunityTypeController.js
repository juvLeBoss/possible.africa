const OpportunityType = require("./opportunityTypeModel");
const CustomUtils = require("../../utils/index.js");

// @Get all opportunity types
// @Route: /api/v1/opportunityTypes
// @Access: Public
exports.getAllOpportunityTypes = async (req, res, next) => {
  const { limit, page, sort, fields } = req.query;
  const queryObj = CustomUtils.advancedQuery(req.query);
  try {
    const opportunityTypes = await OpportunityType.find(queryObj)
      .limit(limit * 1)
      .sort({
        createdAt: -1,
        ...sort,
      })
      .select(fields);
    res.status(200).json(opportunityTypes);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @Get opportunity type by id
// @Route: /api/v1/opportunityTypes/:id
// @Access: Public
exports.getOpportunityTypeById = async (req, res) => {
  try {
    // get opportunity type by id
    const opportunityType = await OpportunityType.findById(req.params.id);
    if (!opportunityType)
      return res.status(404).json({
        message: `OpportunityType with id: ${req.params.id} not found !`,
      });
    res.status(200).json(opportunityType);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @Create new opportunity type
// @Route: /api/v1/opportunityTypes
// @Access: Private
exports.createOpportunityType = async (req, res) => {
  const CustomBody = { ...req.body };
  const slug = CustomUtils.slugify(CustomBody.name);
  try {
    CustomBody.slug = slug;
    // create new opportunity type
    const opportunityType = await OpportunityType.create(CustomBody);
    res.status(201).json(opportunityType);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @Update opportunity type by id
// @Route: /api/v1/opportunityTypes/:id
// @Access: Private
exports.updateOpportunityType = async (req, res) => {
  try {
    const opportunityType = await OpportunityType.findById(req.params.id);
    if (!opportunityType) {
      return res.status(404).json({ message: "OpportunityType not found !" });
    }

    const updated = await OpportunityType.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    return res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @Delete opportunity type by id
// @Route: /api/v1/opportunityTypes/:id
// @Access: Private
exports.deleteOpportunityType = async (req, res, next) => {
  try {
    const opportunityType = await OpportunityType.findById(req.params.id);
    if (!opportunityType)
      return res.status(404).json({ message: `OpportunityType not found !` });
    await OpportunityType.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "OpportunityType deleted successfully !" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
