import React, {useState, useEffect, Fragment} from "react";
import config from "../../Config";
import {Link} from "react-router-dom";


const LatestProducts = (props) => {
    const [products, setProducts] = useState([]);

    const getUrl = (prod) => {
        if (!prod.images || prod.images.length === 0) {
            return "https://place-hold.it/80x80";
        }

        return `${config.imageUrl}${prod.images[0].name}`;
    };

    useEffect(() => {
        fetch(`${config.searchUrl}/api/products/latest/5`)
            .then((res) => res.json())
            .then((res) => {
                setProducts(res.data);
            })
            .catch((err) => console.log(err));
    }, [props]);

    return (
        <Fragment>
            <div className="module product-simple">
                <h3 className="modtitle">
                    <span>Latest products</span>
                </h3>
                <div className="modcontent">
                    <div id="so_extra_slider_1" className="extraslider">
                        <div className="yt-content-slider extraslider-inner">
                            <div className="item">
                                {products.map((product) => {
                                    return (
                                        <div className="product-layout item-inner style1">
                                            <div className="item-image">
                                                <div className="item-img-info">
                                                    <Link
                                                        to={{pathname: `/products/${product.slug}`}}
                                                        target="_self"
                                                        title={product.name}
                                                    >
                                                        <img src={getUrl(product)} alt={product.name}/>
                                                    </Link>
                                                </div>
                                            </div>
                                            <div className="item-info">
                                                <div className="item-title">
                                                    <Link
                                                        to={{pathname: `/products/${product.slug}`}}
                                                        target="_self"
                                                        title={product.name}
                                                    >
                                                        {product.name}
                                                    </Link>
                                                </div>
                                                <div className="content_price price">
                          <span className="price-new product-price">
                            ${product.price}{" "}
                          </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default LatestProducts;
