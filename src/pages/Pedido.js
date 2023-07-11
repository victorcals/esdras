import React, { useEffect, useState } from "react";
import api from '../services/api';
import { Row, Col } from 'react-bootstrap';
import { Link } from "react-router-dom";

function Home() {
    const [categories, setCategories] = useState([]);
    const [livros, setlivros] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [orderBy, setOrderBy] = useState('titulo');
    const [orderDirection, setOrderDirection] = useState('asc');
    const [activeCategory, setActiveCategory] = useState('');

    useEffect(() => {
        api.get('/livros')
            .then(response => {
                const categories = response.data;
                setCategories(categories);
                if (categories.length > 0) {
                    setActiveCategory(categories[0]._id);
                }
            })
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        api.get('/livros', { params: { category: activeCategory } })
            .then(response => response.data)
            .then(data => {
                setlivros(data);
            })
            .catch(err => console.error(err));
    }, [activeCategory]);

    if (!livros) {
        return <p>Carregando...</p>;
    }

    const handleOrderByChange = event => {
        const [newOrderBy, newOrderDirection] = event.target.value.split(',');
        setOrderBy(newOrderBy);
        setOrderDirection(newOrderDirection);
    };

    const comparelivros = (a, b) => {
        let comparison = 0;
        if (orderBy === 'titulo') {
            comparison = a.titulo.localeCompare(b.titulo);
        } else if (orderBy === 'preco') {
            comparison = parseFloat(a.preco) - parseFloat(b.preco);
        }
        if (orderDirection === 'desc') {
            comparison *= -1;
        }
        return comparison;
    };

    const sortedlivros = [...livros].sort(comparelivros);

    const handleSearchInputChange = event => {
        setSearchTerm(event.target.value);
    };

    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = [].slice.call(new Uint8Array(buffer));
        bytes.forEach((b) => (binary += String.fromCharCode(b)));
        return window.btoa(binary);
    };

    const [isRented, setIsRented] = useState(false);

    const handleButtonClick = () => {
        setIsRented(!isRented);
    };

    const renderlivrosByCategory = () => {
        return (
            <div className="category-container mt-3">
                {categories.map(category => (
                    <Row key={category._id}>
                        <Col className="mr-5">
                            <div className="livros-container">
                                <Row>
                                    {sortedlivros
                                        .filter(product => product.category === category._id)
                                        .filter(product => product.titulo.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map(product => (
                                            <Col key={product.codigo} xs={12} sm={6} md={4} lg={3}>
                                                <div className="card text-white bg-dark mb-3">
                                                    <Link to={`/detalhes/${product.codigo}`} style={{ textDecoration: 'none' }}>
                                                        <img src={`data:image/png;base64,${product.image}`} alt={product.titulo} className="card-img-top" style={{ height: 300, width: 300 }} />
                                                        <div className="card-body">
                                                            <h5 className="card-title" style={{ color: "white" }}>{product.titulo}</h5>
                                                            <p><b style={{ color: "white" }}>R$ {product.Autor}</b></p>
                                                            <p><b style={{ color: "white" }}>R$ {product.Ano}</b></p>
                                                            <button onClick={handleButtonClick}>
                                                                {isRented ? "Alugado" : "Alugar"}
                                                            </button>
                                                        </div>
                                                    </Link>
                                                </div>
                                            </Col>
                                        ))}
                                </Row>
                            </div>
                        </Col>
                    </Row>
                ))}
            </div>
        );
    }

    return (
        <div className="d-flex justify-content-between mr-md-1">
            {renderlivrosByCategory()}
        </div>
    );
}

export default Home;
