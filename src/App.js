import React from 'react';
import apiMaster from './apiMaster';
import { hot } from 'react-hot-loader/root';
import 'bootstrap/dist/css/bootstrap.min.css';

import Cookies from 'universal-cookie';

import NavigationBar from './components/navigationBar';
import AlertBar from './components/alertBar';
import ProductDetail from './components/product-detail/productDetail';
import RelatedItems from './components/related-items-creation/relatedItems';
import QuestionsAndAnswers from './components/questions-and-answers/questionsAndAnswers';
import RatingsReviews from './components/ratings-and-reviews/ratingsReviews';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentProduct: {},
      averageRating: 0,
      currentRating: {},
      userToken: null,
    };

    this.calculateAverageRating = this.calculateAverageRating.bind(this);
    this.productCardClicked = this.productCardClicked.bind(this);
  }

  componentDidMount() {
    this.generateUserToken();
    apiMaster
      .getProductInfo()
      .then(({ data }) => {
        this.setState({ currentProduct: data });
      })
      .catch((err) => {
        console.log(err);
      });

    apiMaster
      .getReviewMetaData()
      .then(({ data }) => {
        let averageRating = this.calculateAverageRating(data.ratings);
        this.setState({
          averageRating: averageRating,
          currentRating: data
        }, () => console.log('new app state', this.state.currentRating));
      })
      .catch((err) => {
        console.log(err);
      });
    apiMaster
      .getReviewsOfProduct(this.props.currentProductId, 'relevant', 20)
      .then(({ data }) => {
        let ratings = this.getRatings(data.results);
        let recommend = this.getRecommendation(data.results);
        this.setState({
          reviews: data.results,
          currentProductRatings: ratings,
          recommendProduct: recommend,
          filtered: []
        }, () => {
          console.log('RATINGS AND REVIEWS HAS BEEN UPDATED --- see if it passes down to review list now!', this.state)
        });
      })
      .catch((err) => {
        console.error(err);
      });
  }

  generateUserToken() {
    const cookies = new Cookies();
    if (cookies.get('user') === undefined) {
      var userid = Math.floor(Math.random() * 999999999);
      cookies.set('user', userid);
      console.log(cookies.get('user'));
    }
    this.setState({
      userToken: cookies.get('user'),
    });
  }

  calculateAverageRating(obj) {
    let stars = 0;
    let lengthOfRatings = Object.values(obj).reduce((sum, val) => {
      return (sum += val);
    });
    for (var key in obj) {
      stars += key * obj[key];
    }
    let averageRatings = stars / lengthOfRatings;
    return averageRatings;
  }

  productCardClicked(productId) {
    apiMaster
      .getProductInfo(productId)
      .then(({ data }) => {
        this.setState({ currentProduct: data });
      })
      .catch((err) => {
        console.log(err);
      });

    apiMaster
      .getReviewMetaData(productId)
      .then(({ data }) => {
        let averageRating = this.calculateAverageRating(data.ratings);
        this.setState({
          averageRating: averageRating,
          currentRating: data
        });
      })
      .catch((err) => {
        console.log(err);
      });
    
  }

  render() {
    return (
      <div>
        <NavigationBar />
        <AlertBar />
        <div>
          <ProductDetail
            product={this.state.currentProduct}
            averageRating={this.state.averageRating}
            userToken={this.state.userToken}
          />
        </div>
        <div>
          <RelatedItems
            currentProductID={this.state.currentProduct.id}
            currentProductName={this.state.currentProduct.name}
            currentProductFeatures={this.state.currentProduct.features}
            calculateAverageRating={this.calculateAverageRating}
            productCardClicked={this.productCardClicked}
          />
        </div>
        <div className="widget">
          <QuestionsAndAnswers
            currentProductID={this.state.currentProduct.id}
            currentProductName={this.state.currentProduct.name}
          />
        </div>
        <div className="widget">
          <RatingsReviews
            currentProductName={this.state.currentProduct.name}
            currentProductID={this.state.currentProduct.id}
            averageRating={this.state.averageRating}
            currentRating={this.state.currentRating}
          />
        </div>
      </div>
    );
  }
}

export default hot(App);
