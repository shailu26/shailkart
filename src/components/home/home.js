import React, {Component} from 'react';
import './home.scss';
import Cookies from 'universal-cookie';
import axios from '../../services/axios';
import {environment} from '../../environment';
import {connect} from 'react-redux';
const Cookie = new Cookies();

class Home extends Component {
    state = {
        products: [],
        skip: 0,
        auth: Cookie.get('token')
            ? true
            : false,
        maxLimit: 0,
        checkFirstTime: true
    }

    componentDidMount() {
        if (this.state.auth) {
            this.fetchProducts();
        }
    }

    fetchProducts() {
        if (this.state.products.length < this.state.maxLimit || this.state.checkFirstTime) {
            axios
                .get(`${environment.baseUrl}/api/product/productList?skip=${this.state.skip}`)
                .then(result => {
                    result.data.products.forEach(product => {
                        product.addedToCart = Cookie.get(product._id) ? true: false;
                    }) 
                    console.log(result.data.products)
                    this.setState({maxLimit: result.data.count, products: [...this.state.products, ...result.data.products], checkFirstTime: false});
                })
                .catch(err => {
                    console.log({err});
                });
        } else {
            console.log('no data to scroll now');
        }
    }

    handleScroll = (e) => {
        const {offsetHeight, scrollTop, scrollHeight} = e.target
        if (offsetHeight + scrollTop === scrollHeight) {
            this.setState({skip: this.state.products.length});
            this.fetchProducts();
        }
    }

    render() {
        const {products} = this.state;
        return (
            <div className="home-container">
                {this.state.auth
                    ? <div className="product-container" onScroll={this.handleScroll}>
                            <div className="products-list row">
                                
                                {products.map((list, index) => {
                                    return <div className="col-md-3 col-sm-6 shadow products" key={index}>
                                        
                                            <div className="product-grid3">
                                                <div className="product-image3">
                                                    <div className="img-wrap card-img" style={{backgroundImage: `url(${list.image})`}}>
                                                    <div className="card-actions">
                                                            
                                                            <span className="card-action">
                                                                <button className="btn btn-xs btn-circle btn-cart-primary" data-toggle="button" onClick={() => this.props.addToCart(list)}>
                                                                <i className="fa fa-shopping-cart"></i>
                                                                </button>
                                                            </span>
                                                            <span className="card-action">
                                                                <button className="btn btn-xs btn-circle btn-cart-primary" data-toggle="button">
                                                                <i className="fa fa-heart"></i>
                                                                </button>
                                                            </span>
                                                            </div>
                                                    </div>
                                                
                                                </div>
                                                <div className="product-content">
                                                    <div className="title">{list.name}</div>
                                                    <div className="price">
                                                        {list.price} ₹
                                                    </div>
                                                    
                                                </div>
                                                <div className="add-to-cart" onClick={() => this.props.addToCart(list)}>Add to cart</div>
                                            </div>
                                        </div>
                                    
                                })}
                            </div>
                        </div>
                    : <div className="no-product">
                        <h3>
                            Login to view products
                        </h3>
                        </div>}
            </div>
        )
    }
}

const mapDispatchToProps = (dispatch) => {
    console.log(dispatch);
    return {
        addToCart: (list) => {
            if (!Cookie.get('cartItems')) {
                Cookie.set('cartItems', {});
            }
            if (!Cookie.get('totalCartItem')) {
                Cookie.set('totalCartItem', 0);
            }
            let cartItems = Cookie.get('cartItems');
            if (cartItems.hasOwnProperty(list._id)) {
                console.log('no no no');
                cartItems[list._id].count = cartItems[list._id].count + 1;
            } else {
                console.log('yes yes');
                list.count = 1;
                cartItems[list._id] = list;
            }
            Cookie.set('cartItems', cartItems);
            Cookie.set('totalCartItem', (parseInt(Cookie.get('totalCartItem')) + 1))
            dispatch({type: 'INCREMENT'})
        },
    }
}
export default connect(null, mapDispatchToProps)(Home);
