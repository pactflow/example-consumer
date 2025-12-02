import React from 'react';
import 'spectre.css/dist/spectre.min.css';
import 'spectre.css/dist/spectre-icons.min.css';
import 'spectre.css/dist/spectre-exp.min.css';
import Layout from './Layout';
import Heading from './Heading';
import API from './api';

class SearchPage extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            term: "",
            loading: false,
            products: []
        };
    }

    componentDidUpdate(_prevProps) {
        console.log(_prevProps);
        if (this.state.term.length > 3) {

            API.keywordSearch(this.state.term)
                .then((r) => {
                    this.setState({
                        loading: false,
                        products: r.products
                    });
                })
                .catch(() => {
                    this.setState({error: true});
                });
        }
    }

    render() {
        if (this.state.error) {
            throw Error('unable to search');
        }
        const productInfoList =
            (<ul>
                {this.state.products.map((product, index) => (
                    <li key={`product${index}`}>
                        <p>ID: {product.id}</p>
                        <p>Name: {product.name}</p>
                        <p>Type: {product.type}</p>
                    </li>
                ))}
            </ul>)

        return (
            <Layout>
                <Heading text="Products" href="/"/>
                <div>
                    Search Term: <input name="term" onChange={e => this.setState({term: e.target.value})}/>
                </div>
                {this.state.loading ? (
                    <div
                        style={{
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                        className="loading loading-lg"
                    />
                ) : (
                    (this.state.products.length > 0) && productInfoList
                )}
            </Layout>
        );
    }
}

SearchPage.propTypes = {
    // match: PropTypes.array.isRequired,
    // history: PropTypes.shape({
    //     push: PropTypes.func.isRequired
    // }).isRequired
};

export default SearchPage;
