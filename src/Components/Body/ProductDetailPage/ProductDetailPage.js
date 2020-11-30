import React, {useState, useEffect} from 'react';
import './ProductDetailPage.css';
import Input from '@material-ui/core/Input';
import {makeStyles} from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {useParams} from 'react-router-dom';
import {useDispatch, useSelector} from 'react-redux';
import {updateCartState} from '../../../actions/index';
import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import emptyCartImg from './cart.png';

import config from '../../../Config';

const useStyles = makeStyles({
    root : {
        width : 250,
    },
    input : {
        width : 42,
    },
});

function Alert(props) {
    return <MuiAlert elevation={ 6 } variant="filled" { ...props } />;
}

const ProductDetailPage = (props) => {
    const dispatch = useDispatch();
    const {slug} = useParams();
    const [open, setOpen] = useState(false);
    const [popUpMsg, setPopUpMsg] = useState({
        isError : false,
        message : '',
    });
    const [product, setProduct] = useState({
        price : 0,
        images : [],
        attributes : [],
    });
    const classes = useStyles();
    const [value, setValue] = useState(1);
    const [activeImage, setActiveImage] = useState('');
    const [attributes, setAttributes] = useState({});
    const [price, setPrice] = useState(0);

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        setOpen(false);
    };

    useEffect(() => {
        fetch(`${ config.searchUrl }/api/products/${ slug }`)
            .then((res) => res.json())
            .then((res) => {
                if (res.data) {
                    setProduct(res.data);
                    setPrice(res.data.price);
                    setActiveImage(getFirstImageUrl(res.data));
                }
            })
            .catch((err) => console.log(err));
    }, [props]);

    const handleSliderChange = (event, newValue) => {
        setValue(newValue < 1 ? 1 : newValue);
    };

    const handleInputChange = (event) => {
        setValue(event.target.value === '' ? '' : Number(event.target.value));
    };

    const handleBlur = () => {
        if (value < 1) {
            setValue(1);
        } else if (value > 300) {
            setValue(300);
        }
    };

    const addToCart = () => {
        if (
            JSON.parse(localStorage.getItem('cart')) !== null &&
            JSON.parse(localStorage.getItem('cart')) !== 'null'
        ) {
            const {sessionId} = JSON.parse(localStorage.getItem('cart'));
            const {id} = product;
            const data = {
                quantity : value,
                productId : id,
                rate : price,
                attributes : Object.values(attributes),
            };
            fetch(`${ config.cartUrl }/api/cart/${ sessionId }`, {
                method : 'POST',
                headers : {
                    'Content-Type' : 'application/json',
                },
                body : JSON.stringify(data),
            })
                .then((res) => res.json())
                .then((res) => {
                    if (res.status === 200) {
                        updateCartState(JSON.parse(localStorage.getItem('cart')), dispatch);
                        props.history.push({
                            pathname : '/cart',
                        });
                    }
                })
                .catch((err) => console.log(err));
        } else {
            setPopUpMsg({isError : true, message : 'Cart is Null'});
            setOpen(true);
        }
    };

    const updatePrice = (currentAttributes) => {
        const attrPrice = Object.values(currentAttributes)
            .map((attr) => attr.option.price)
            .reduce((sum, row) => sum + row, 0);
        setPrice(attrPrice + product.price);
    };

    const handleSelect = (e, attribute) => {
        const option = attribute.options.find(
            (option) => option.id === +e.target.value
        );
        const currentAttrs = attributes;
        if (option && option.id) {
            currentAttrs[attribute.id] = {
                name : attribute.name,
                option : {
                    name : option.name,
                    price : option.price,
                },
            };
            setAttributes(currentAttrs);
            updatePrice(currentAttrs);
        }
    };

    const getUrl = (image) => {
        if (!image || !image.name) {
            return '/image/catalog/demo/product/270/10.jpg';
        }

        return `${ config.imageUrl }${ image.name }`;
    };

    const getFirstImageUrl = (prod) => {
        return getUrl(prod.images ? prod.images[0] : null);
    };

    return !product || !product.id ? (
        <div className="success-page-container">
            <div className="success-card">
                <div className="success-logo">
                    <img src={ emptyCartImg } alt="success"/>
                </div>
                <div className="scard-text-container">
                    <h3>OOPS!</h3>
                    <p>The product you are trying to view does not exist.</p>
                </div>
            </div>
        </div>
    ) : (
        <div className="product-detail-container">
            <div className="product-detail-box">
                <div className="product-detail-left">
                    <div className="product-detail-img-list">
                        <ul>
                            { product.images.map((image, index) => {
                                return (
                                    <li
                                        key={ index }
                                        className="owl-item"
                                        onClick={ (e) => setActiveImage(getUrl(image)) }
                                    >
                                        <img
                                            src={ getUrl(image) }
                                            style={ {width : '100%', height : '100%'} }
                                        />
                                    </li>
                                );
                            }) }
                        </ul>
                    </div>
                    <div className="prodct-detail-img">
                        <img src={ activeImage } className="product-img"/>
                    </div>
                </div>
                <div className="product-detail-right">
                    <div className="product-detail-title">
                        <h1>{ product.name }</h1>
                    </div>
                    <div className="product-box-desc">
                        <div className="inner-box-desc space">
                            <div className="price-tax">
                                <span>Price:</span> ${ price }
                            </div>
                        </div>
                    </div>
                    { product.attributes && product.attributes.length > 0 ? (
                        <div className="short_description space">
                            <h4>Available Options</h4>
                            <div>
                                { product.attributes
                                    ? product.attributes.map((attribute) => (
                                        <div style={ {marginBottom : 15} }>
                                            <label style={ {fontSize : 16} }>{ attribute.name }</label>
                                            <select
                                                className="form-control"
                                                onChange={ (e) => handleSelect(e, attribute) }
                                            >
                                                <option value={ 0 }>--select an option--</option>
                                                { attribute.options.map((option) => (
                                                    <option value={ option.id } name={ option.name }>
                                                        { option.name } (+${ option.price })
                                                    </option>
                                                )) }
                                            </select>
                                        </div>
                                    ))
                                    : '' }
                            </div>
                        </div>
                    ) : null }
                    <Typography id="input-slider" gutterBottom style={ {fontSize : 16} }>
                        Quantity
                    </Typography>
                    <Grid container spacing={ 2 } alignItems="center">
                        <Grid item xs>
                            <Slider
                                value={ typeof value === 'number' ? value : 1 }
                                onChange={ handleSliderChange }
                                aria-labelledby="input-slider"
                            />
                        </Grid>
                        <Grid item>
                            <Input
                                className={ classes.input }
                                value={ value }
                                margin="dense"
                                onChange={ handleInputChange }
                                onBlur={ handleBlur }
                                inputProps={ {
                                    step : 1,
                                    min : 1,
                                    max : 100,
                                    type : 'number',
                                    'aria-labelledby' : 'input-slider',
                                } }
                            />
                        </Grid>
                    </Grid>
                    <Button
                        variant="outlined"
                        style={ {
                            backgroundColor : '#ff3c20',
                            color : 'white',
                            border : 'none',
                            fontSize : 14,
                            marginTop : 30,
                        } }
                        onClick={ addToCart }
                    >
                        Add to Cart
                    </Button>
                </div>
            </div>
            <div className="description-container">
                <h1>Description</h1>
                <div className="description-content" dangerouslySetInnerHTML={ {__html : product.description} }></div>
            </div>
            <Snackbar open={ open } autoHideDuration={ 6000 } onClose={ handleClose }>
                <Alert
                    severity={ popUpMsg.isError ? 'error' : 'success' }
                    onClose={ handleClose }
                    style={ {fontSize : 16} }
                >
                    { popUpMsg.message }
                </Alert>
            </Snackbar>
        </div>
    );
};

export default ProductDetailPage;
