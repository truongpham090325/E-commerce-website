import { Request, Response } from "express";
import Product from "../../models/product.model";
import AttributeProduct from "../../models/attribute-product.model";
import axios from "axios";
import { getInfoAddress } from "../../helpers/location.helper";
import { pointConfig } from "../../configs/variable.config";
import { getApiShipping } from "../../configs/setting.config";

export const list = async (req: Request, res: Response) => {
  try {
    const { cart, userAddress } = req.body;
    const cartDetail: any[] = [];

    // Lấy thông tin chi tiết sản phẩm
    for (const item of cart) {
      const productDetail = await Product.findOne({
        _id: item.productId,
        deleted: false,
        status: "active",
      });

      if (productDetail) {
        const attributeList = await AttributeProduct.find({
          _id: { $in: productDetail.attributes },
        })
          .select("id name")
          .lean();

        const itemDetail = {
          ...item,
          detail: {
            images: productDetail.images,
            slug: productDetail.slug,
            name: productDetail.name,
            priceNew: productDetail.priceNew,
            priceOld: productDetail.priceOld,
            stock: productDetail.stock,
            attributeList: attributeList,
            variants: productDetail.variants,
          },
        };

        cartDetail.push(itemDetail);
      }
    }
    // Hết lấy thông tin chi tiết sản phẩm

    // Tính phí ship
    let shippingOptions = null;
    if (userAddress) {
      // Tọa độ của người gửi
      const shopLocation = {
        lat: 20.7235018,
        lng: 105.8821633,
      };

      const shopInfoAddress = await getInfoAddress(
        shopLocation.lat,
        shopLocation.lng,
      );

      const userAddressInfo = await getInfoAddress(
        userAddress.latitude,
        userAddress.longitude,
      );

      // Tính trọng lượng đơn hàng
      const totalWeight = cartDetail.reduce(
        (total, item) => total + item.quantity * 500,
        0,
      );

      const dataGoShip = {
        shipment: {
          address_from: {
            city: shopInfoAddress.city, // Lấy từ API: /cities
            district: shopInfoAddress.district, // Lấy từ API: /districs
            ward: shopInfoAddress.ward, // Lấy từ API: /wards
          },
          address_to: {
            city: userAddressInfo.city,
            district: userAddressInfo.district,
            ward: userAddressInfo.ward,
          },
          parcel: {
            cod: "0", // Tiền thu hộ
            amout: "0", // Giá trị khai giá
            weight: totalWeight,
            width: "10",
            height: "10",
          },
        },
      };

      const apiShipping = await getApiShipping();

      const goshipRes = await axios.post(
        "https://sandbox.goship.io/api/v2/rates",
        dataGoShip,
        {
          headers: {
            Authorization: `Bearer ${apiShipping.tokenGoShip}`,
            "Content-Type": "application/json",
          },
        },
      );

      shippingOptions = goshipRes.data.data;
    }
    // Hết Tính phí ship

    // Trả thêm điểm của người dùng
    const point = {
      canUsePoint: 0,
      POINT_TO_MONEY: pointConfig.POINT_TO_MONEY,
    };
    if (res.locals.accountUser) {
      point.canUsePoint =
        res.locals.accountUser.totalPoint - res.locals.accountUser.usedPoint;
    }
    // Hết Trả thêm điểm của người dùng

    res.json({
      code: "success",
      message: "Thành công!",
      cart: cartDetail,
      shippingOptions: shippingOptions,
      point: point,
    });
  } catch (error) {
    res.json({
      code: "error",
      message: "Không lấy được dữ liệu!",
    });
  }
};

export const cart = (req: Request, res: Response) => {
  res.render("client/pages/cart", {
    pageTitle: "Giỏ hàng",
  });
};
