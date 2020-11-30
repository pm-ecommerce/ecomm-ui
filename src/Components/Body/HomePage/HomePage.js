import React, {useState, useEffect, Fragment} from 'react';
import './HomePage.css';
import ProductList from '../ProductList/ProductList';
import {Route, Switch} from 'react-router-dom';
import config from '../../../Config';
import LatestProducts from '../../Common/LatestProducts';

const url = config.searchUrl;

function importAll(r) {
    return r.keys().map(r);
}

const images = importAll(require.context('./img', false, /\.(png|jpe?g|svg)$/));

const DefaultPage = () => {
    const [sections, setSections] = useState([]);
    const [product, setProduct] = useState({});
    useEffect(() => {
        fetch(`${ url }/api/categories/random`)
            .then((res) => res.json())
            .then((res) => {
                setSections(res.data);
                res.data.forEach((category) => {
                    const name = category.name;
                    fetch(`${ url }/api/categories/products/${ category.id }`)
                        .then((res) => res.json())
                        .then((res) => {
                            setProduct(prevState => ({...prevState, [name] : res.data}));
                        })
                        .catch((err) => console.log(err));
                });
            })
            .catch((err) => console.log(err));
    }, []);

    return (
        <Fragment>
            <div className="row">
                <div className="col-lg-2 col-md-3 col-sm-4 col-xs-12 main-left sidebar-offcanvas">
                    <div className="module col1 hidden-sm hidden-xs"></div>
                    <LatestProducts/>
                </div>
                <div className="col-lg-10 col-md-9 col-sm-8 col-xs-12 main-right">
                    <div className="slider-container row">
                        { sections.map((section) => (
                            !product[section.name] || !product[section.name].data || product[section.name].data.length === 0 ? null :
                                <div className="product-list-container" key={ section.name }>
                                    <div className="module">
                                        <h3 className="modtitle">
                                            <span>TRENDING IN { section.name }</span>
                                        </h3>
                                    </div>
                                    <ProductList list={ product[section.name] }/>
                                </div>
                        )) }
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

const HomePage = (props) => {
    const [categories, setCategories] = useState([]);
    useEffect(() => {
        fetch(`${ url }/api/categories/`)
            .then((res) => res.json())
            .then((res) => {
                console.log(res);
                const obj = res.data.map((category, index) => ({
                    name : category.name,
                    id : category.id,
                    image : images[index],
                }));
                setCategories(obj);
            })
            .catch((err) => console.log(err));
    }, []);

    return (
        <div id="content">
            <Switch>
                <Route exact path="/" component={ DefaultPage }/>
            </Switch>
        </div>
    );
};

export default HomePage;
