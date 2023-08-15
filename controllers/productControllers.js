const Products = require("../models/Products");
const Users = require("../models/Users");
const HttpException = require("../exception/httpException");
const axios = require("axios");
const cheerio = require("cheerio");

exports.createProductDetails = async (req, res) => {
  try {
    const { id } = req.user;
    const { productUrl } = req.body;

    const user = await Users.findById(id);
    if (!user) throw new HttpException(400, `User with ${id} does not exist!!`);

    if (!productUrl)
      throw new HttpException(
        400,
        `Product with URL:  ${productUrl} does not exist!!`
      );

    const existingProduct = await Products.findOne({
      url: productUrl,
      user: id,
    });

    if (existingProduct) {
      return res.status(200).json({
        success: true,
        message: `Data of product with URL: ${productUrl} already exists in the database.`,
        data: { product: getProductDetails(existingProduct) },
      });
    }

    const response = await axios.get(productUrl);
    const html = response.data;
    const cheerioInstance = cheerio.load(html);

    const productTitle = cheerioInstance("span.B_NuCI").text() || "NA";
    const productDescription =
      cheerioInstance("div._1mXcCf.RmoJUa").text() || "NA";
    const productPrice = cheerioInstance("div._30jeq3._16Jk6d").text() || "NA";
    const numberOfReviewsAndRatings =
      cheerioInstance("span._2_R_DZ").text() || "NA";
    const productRatings = cheerioInstance("div._2c2kV-").text() || "NA";
    const mediaCountElement = cheerioInstance("ul._3GnUWp");
    const mediaCounts = mediaCountElement.find("li").length || 0;

    const product = new Products({
      title: productTitle,
      description: productDescription,
      price: productPrice,
      noOfReviewsAndRatings: numberOfReviewsAndRatings,
      ratings: productRatings,
      mediaCounts: mediaCounts,
      url: productUrl,
      user: id,
    });

    await product.save();

    res.status(200).json({
      success: true,
      message: "Product data fetched successfully and saved to the database.",
      data: getProductDetails(product),
    });
  } catch (err) {
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Failed to fetch Product data",
    });
  }
};

function getProductDetails(product) {
  return {
    title: product.title,
    description: product.description,
    price: product.price,
    noOfReviewsAndRatings: product.noOfReviewsAndRatings,
    ratings: product.ratings,
    mediaCount: product.mediaCounts,
  };
}
