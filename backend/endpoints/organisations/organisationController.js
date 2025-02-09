const Organisation = require("./organisationModel");
const OrganisationType = require("../organisationTypes/organisationTypeModel");
const download = require("image-downloader");
const CustomUtils = require("../../utils/index.js");
const axios = require("axios");
const { Buffer } = require("buffer");
const fs = require("fs");

async function downloadMedia(mediaUrl) {
  try {
    const options = {
      url: mediaUrl,
      dest: "../../endpoints/organisations/img",
      extractFilename: true,
    };
    const res = await download.image(options);
    const imageData = fs.readFileSync(res.filename).toString("base64");
    const dataUrl = `data:${`image/${res.filename
      .split(".")
      .pop()}`};base64,${imageData}`;
    fs.unlinkSync(res.filename);
    return dataUrl;
  } catch (error) {
    console.error(error);
    return null;
  }
}

exports.getMetaData = async (req, res) => {
  try {
    const response = await axios.get(req.query.url);
    // Traitez la réponse selon vos besoins, par exemple, extrayez la méta-description.
    // Vous pouvez ensuite renvoyer ces données au frontend.
    res.json(response.data);
  } catch (error) {
    console.error('Une erreur s\'est produite :', error);
    res.status(500).send('Erreur lors de la récupération des données.');
  }
}

exports.getWpImageBuffer = async (req, res) => {
  const dataUrl = await downloadMedia(req.body.url);
  return res.status(200).json({ dataUrl });
};

// @Get all organisations
// @route GET /api/v1/organisations
// @access Public
exports.getAllOrganisations = async (req, res) => {
  const { limit, page, sort, fields } = req.query;
  const queryObj = CustomUtils.advancedQuery(req.query);
  // console.log(queryObj);
  try {
    const organisations = await Organisation.find(queryObj)
      .limit(limit * 1)
      .sort({ createdAt: -1, ...sort })
      .select(fields);
    res.status(200).json(organisations);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @Get organisation by id
// @route GET /api/v1/organisations/:id
// @access Public
exports.getOrganisationById = async (req, res) => {
  // get organisation by id
  try {
    const organisation = await Organisation.findById(req.params.id);
    if (!organisation)
      return res.status(404).json({
        message: CustomUtils.consts.NOT_EXIST,
      });
    res.status(200).json(organisation);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// @Create organisation
// @route POST /api/v1/organisations
// @access Public
exports.createOrganisation = async (req, res) => {
  const CustomBody = { ...req.body };
  const name = CustomBody.name;
  const slug = CustomUtils.slugify(name);
  try {
    if (req.user) CustomBody.contributeur = req.user._id;
    CustomBody.slug = slug;
    const organisation = await Organisation.create(CustomBody);
    res.status(201).json(organisation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @Update organisation
// @route PUT /api/v1/organisations/:id
// @access Public
exports.updateOrganisation = async (req, res) => {
  const CustomBody = { ...req.body };
  try {
    const organisation = await Organisation.findById(req.params.id);
    if (!organisation) {
      return res.status(404).json({ message: CustomUtils.consts.NOT_EXIST });
    }

    if (req.user) CustomBody.contributeur = organisation.contributeur;

    const updatedOrganisation = await Organisation.findByIdAndUpdate(
      req.params.id,
      CustomBody,
      { new: true }
    );
    res.json(updatedOrganisation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @Delete organisation
// @route DELETE /api/v1/organisations/:id
// @access Public
exports.deleteOrganisation = async (req, res) => {
  try {
    const organisation = await Organisation.findById(req.params.id);
    if (!organisation) {
      return res.status(404).json({ message: CustomUtils.consts.NOT_EXIST });
    }
    await Organisation.findByIdAndDelete(req.params.id);
    res.json({});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
