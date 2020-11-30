import React, {useEffect} from 'react';
import {Link, withRouter} from 'react-router-dom';
import config from '../../Config';

const Header = (props) => {
    const year = new Date().getFullYear();
    useEffect(() => {
    }, [props]);

    return (
        <footer className="footer-container typefooter-1">

            <div className="footer-middle ">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 col-style">
                            <ul className="footer-links font-title">
                                <li><Link to={ {pathname : '/'} }>Home page</Link></li>
                                <li><Link to={ {pathname : '/login'} }>User login</Link></li>
                                <li><Link to={ {pathname : '/register'} }>User registration</Link></li>
                                <li><a href={config.vendorLoginUrl}>Business login</a></li>
                                <li><Link to={ {pathname : '/vendor-register'} }>Register your business</Link></li>
                            </ul>

                        </div>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="container">
                    <div className="copyright">
                        PM Ecommerce &copy; { year } PM Shopping Mall. All Rights Reserved.
                    </div>
                </div>
            </div>
            <div className="back-to-top"><i className="fa fa-angle-up"></i></div>
        </footer>
    );
};

export default withRouter(Header);
