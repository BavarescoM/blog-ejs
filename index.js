const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const connection = require("./database/database");
const categoriesController = require('./categories/CategoriesController');
const articlesController = require('./articles/ArticlesController');
const Category = require('./categories/Category');
const Article = require('./articles/Article');
const UserController = require('./users/UserController')
const session = require('express-session');

//view engine
app.set('view engine', 'ejs');

//sessions
app.use(session({
    secret:'qwertyasdfgh',
    cookie: {maxAge: 100000}
}))

//static
app.use(express.static('public'));

//bodyparser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

//databse
connection.authenticate().then(() => {
    console.log('conectado ao banco');
}).catch(error => {
    console.log('Erro ao conectar ao banco' + error);
})

app.use('/', categoriesController);
app.use('/', articlesController);
app.use('/', UserController);

app.get('/', (req, res) => {
    Article.findAll({ order: [['id', 'desc']], limit: 3 }).then((articles) => {
        Category.findAll().then((categories) => {
            res.render('index', { articles, categories });
        })
    })
})

app.get('/:slug', (req, res) => {
    var slug = req.params.slug;
    Article.findOne({
        where: { slug: slug }
    }).then((article) => {
        if (article != undefined) {
            Category.findAll().then((categories) => {
                res.render('article', { article, categories });
            })
        } else {
            res.redirect('/');
        }
    }).catch(error => {
        res.redirect('/');
    })
})

app.get('/category/:slug', (req, res) => {
    var slug = req.params.slug;
    Category.findOne({ where: { slug: slug }, include: [{ model: Article }] }).then((category) => {
        if (category != undefined) {
            Category.findAll().then((categories) => {
                res.render('index', { articles: category.articles, categories: categories })
            })
        } else {
            res.redirect('/')
        }
    }).catch(error => {
        res.redirect('/')
    })

})

app.listen(8080, () => {
    console.log('Server Rodando')
})