import React, {useState, useEffect, Fragment} from 'react';
import ProductList from '../ProductList/ProductList';
import Pagination from '@material-ui/lab/Pagination';
import './SearchPage.css';
import config from '../../../Config';
import {Link} from 'react-router-dom';

const SearchPage = (props) => {
    const query = new URLSearchParams(props.location.search);
    const categoryId = query.get('categoryId') || 0;
    const searchWord = query.get('query') || '';
    const [page, setPage] = useState(1);
    const [list, setList] = useState([]);

    const loadSearch = (page = 1) => {
        const url = new URL(`${ config.searchUrl }/api/search`);
        const params = {
            limit : 20,
            page
        };
        if (searchWord.length > 0) {
            params.name = searchWord;
        }
        if (categoryId > 0) {
            params.categoryId = categoryId;
        }

        url.search = new URLSearchParams(params).toString();

        fetch(url)
            .then((res) => res.json())
            .then((res) => {
                setList(res.data);
            })
            .catch((err) => console.log(err));
    };

    const onChange = (e, p) => {
        if (p !== page && p > 0 && p <= list.totalPages) {
            setPage(p);
        }
    };

    useEffect(() => {
        loadSearch(page);
    }, [props]);

    return (
        <Fragment>
            <ul className="breadcrumb">
                <li><Link to="/"><i className="fa fa-home"></i></Link></li>
                <li><Link to={ '/search'}>Search</Link></li>
            </ul>
            <div className="row">
                <div id="content">
                    <div className="product-category">
                        <h3 className="title-category ">
                            <span>Showing search results for { searchWord }</span>
                        </h3>
                        <ProductList list={ list }/>
                        <div className="pagination-container">
                            <Pagination
                                count={ list.totalPages }
                                variant="outlined"
                                color="primary"
                                onChange={ onChange }
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    );
};

export default SearchPage;
