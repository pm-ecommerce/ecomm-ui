import React, {useState, useEffect, Fragment, useMemo} from 'react';
import config from '../../../Config';
import Button from '@material-ui/core/Button';

import './UserDashBoard.css';
import Pagination from '@material-ui/lab/Pagination';
import Dialog from '@material-ui/core/Dialog';
import Snackbar from '@material-ui/core/Snackbar';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Alert from '@material-ui/lab/Alert';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';

const UserDashBoard = () => {
    const [completeOrders, setCompleteOrders] = useState({data : []});
    const [activeOrders, setActiveOrders] = useState({data : []});
    const [orders, setOrders] = useState({data : []});
    const [tab, setTab] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState({});
    const [open, setOpen] = useState(false);
    const [popUpMsg, setPopUpMsg] = useState({
        isError : false,
        message : '',
    });

    const getImage = (orderItem) => {
        if (!orderItem || !orderItem.image) {
            return 'https://place-hold.it/80x80';
        }

        return `${ config.imageUrl }${ orderItem.image }`;
    };

    const getUserInfo = () => {
        try {
            if (localStorage.getItem('user')) {
                return JSON.parse(localStorage.getItem('user')).id;
            }
            return JSON.parse(localStorage.getItem('cart')).userId;
        } catch (e) {
        }
        return 0;
    };

    const fetchActiveOrders = (page = 1) => {
        const userInfo = {id : getUserInfo()};
        return fetch(`${ config.orderUrl }/api/orders/users/${ userInfo.id }/active?page=${ page }`)
            .then((res) => res.json())
            .then((res) => {
                if (res.status === 200) {
                    setActiveOrders(res.data);
                }
                return res;
            })
            .catch((err) => console.log(err));
    };

    const fetchCompleteOrders = (page = 1) => {
        const userInfo = {id : getUserInfo()};
        return fetch(`${ config.orderUrl }/api/orders/users/${ userInfo.id }/complete?page=${ page }`)
            .then((res) => res.json())
            .then((res) => {
                if (res.status === 200) {
                    setCompleteOrders(res.data);
                }
                return res;
            })
            .catch((err) => console.log(err));
    };

    useEffect(() => {
        fetchCompleteOrders(1);
        fetchActiveOrders(1).then(res => {
            if (res.status === 200) {
                setOrders(res.data);
            }
        });
    }, []);

    const getOrderTotal = (order) => {
        const total = (order.items || []).reduce(
            (sum, row) => sum + row.quantity * row.rate,
            0
        );
        return (total + total * 0.07).toFixed(2);
    };

    const changeTab = (name) => {
        if (name === 'active') {
            setTab(true);
            setOrders(activeOrders);
        } else {
            setTab(false);
            setOrders(completeOrders);
        }
    };

    const formatDate = (date) => {
        if (!Date.parse(date)) {
            return '';
        }
        const obj = new Date(date);

        const mm = obj.getMonth() + 1;
        const dd = obj.getDate();
        const yy = obj.getFullYear();

        return `${ mm < 10 ? '0' + mm : mm }/${ dd < 10 ? '0' + dd : dd }/${ yy }`;
    };

    const onChange = (e, pageNum) => {
        if (orders.currentPage === pageNum) {
            return;
        }

        if (!tab) {
            fetchCompleteOrders(pageNum).then(res => setOrders(res.data));
        } else {
            fetchActiveOrders(pageNum).then(res => setOrders(res.data));
        }
    };

    const closeConfirmation = (cancel = false) => {
        if (!cancel) {
            setDialogOpen(false);
            return;
        }
        return fetch(`${ config.orderUrl }/api/orders/updateStatus/${ selectedOrder.id }/4`)
            .then((res) => res.json())
            .then((res) => {
                if (res.status === 200) {
                    setDialogOpen(false);
                    fetchActiveOrders(1).then(res => setOrders(res.data));
                    setPopUpMsg({error : false, message : res.message});
                } else {
                    setPopUpMsg({error : true, message : res.message});
                }
                console.log('optne');
                setOpen(true);
                return res;
            })
            .catch((err) => console.log(err));
    };

    const cancelOrder = (order) => {
        setSelectedOrder(order);
        setDialogOpen(true);
    };

    const handleClose = () => {
        console.log('handle');
        setOpen(false);
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-box">
                <div className="well" style={ {border : 'none'} }>
                    <div style={ {marginBottom : 10, borderBottom : '1px solid #ccc'} }>
                        <Button
                            variant="outlined"
                            style={ {
                                backgroundColor : (tab === true) ? '#ff3c20' : 'white',
                                color : (tab === true) ? 'white' : 'blue',
                                border : 'none',
                                fontSize : 14,
                                marginTop : 30,
                                marginRight : 3

                            } }
                            onClick={ () => changeTab('active') }
                        >
                            Active Orders
                        </Button>
                        <Button
                            variant="outlined"
                            style={ {
                                backgroundColor : (tab === false) ? '#ff3c20' : 'white',
                                color : (tab === false) ? 'white' : 'blue',
                                border : 'none',
                                fontSize : 14,
                                marginTop : 30,
                            } }
                            onClick={ () => changeTab('complete') }
                        >
                            Past Orders
                        </Button>
                    </div>
                    { orders.data.map((order) => {
                        return (
                            <Fragment>
                                <table className="dashboard-table">
                                    <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Address</th>
                                        <th>Total</th>
                                        {
                                            tab ? <th>Delivery Date</th> : <th>Delivered Date</th>
                                        }
                                        <th>Delivered by</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td>{ order.status }</td>
                                        <td className="text-left" style={ {textAlign : 'left'} }>
                                            { order.address.address1 }, { order.address.address2 }{ ' ' }
                                            <br/>
                                            { order.address.city }, { order.address.zipcode } <br/>
                                            { order.address.state }, { order.address.country }
                                        </td>
                                        <td>${ getOrderTotal(order) }</td>
                                        {
                                            tab ? <td>{ formatDate(order.deliveryDate) }</td> :
                                                <td>{ formatDate(order.deliveredDate) }</td>
                                        }

                                        <td>
                                            <p style={ {margin : 0} }>{ order.vendor.name }</p>
                                            {
                                                tab && order.status === 'RECEIVED' ? <Button
                                                    variant="outlined"
                                                    style={ {
                                                        backgroundColor : 'white',
                                                        color : '#ff3c20',
                                                        border : 'none',
                                                        fontSize : 14,

                                                    } }
                                                    onClick={ () => cancelOrder(order) }
                                                >
                                                    Cancel Order
                                                </Button> : null
                                            }
                                            <p>

                                            </p>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colSpan="5">
                                            <table className="dashboard-table">
                                                <thead>
                                                <tr>
                                                    <th>Image</th>
                                                    <th>Product</th>
                                                    <th>Rate</th>
                                                    <th>Quantity</th>
                                                    <th>Total</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                { (order.items || []).map((item) => (
                                                    <tr>
                                                        <td>
                                                            <img
                                                                src={ getImage(item) }
                                                                className="cart-item-img"
                                                                style={ {width : 80} }
                                                            />
                                                        </td>
                                                        <td>{ item.name }</td>
                                                        <td>${ item.rate }</td>
                                                        <td>{ item.quantity }</td>
                                                        <td>
                                                            ${ (item.rate * item.quantity).toFixed(2) }
                                                        </td>
                                                    </tr>
                                                )) }
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                                <hr style={ {margin : '50px 0', borderTop : '1px solid blue'} }/>
                            </Fragment>
                        );
                    }) }
                    <div className="pagination-container">
                        <Pagination
                            count={ orders.totalPages }
                            variant="outlined"
                            color="primary"
                            onChange={ onChange }
                        />
                    </div>
                </div>
            </div>
            <Dialog
                open={ dialogOpen }
                onClose={ closeConfirmation }
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
                style={ {fontSize : 14} }
            >
                <DialogTitle id="alert-dialog-title"
                             style={ {fontSize : '1.2rem'} }>{ 'Cancel order confirmation' }</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        Are you sure you want to cancel your order?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={ () => closeConfirmation(false) } color="primary">
                        No Please!
                    </Button>
                    <Button onClick={ () => closeConfirmation(true) } color="primary" autoFocus>
                        Yes Please!
                    </Button>
                </DialogActions>
            </Dialog>
            <Snackbar open={ open } autoHideDuration={ 6000 } onClose={ () => handleClose() }>
                <Alert
                    severity={ popUpMsg.isError ? 'error' : 'success' }
                    onClose={ handleClose }
                >
                    { popUpMsg.message }
                </Alert>
            </Snackbar>
        </div>
    );
};

export default UserDashBoard;
