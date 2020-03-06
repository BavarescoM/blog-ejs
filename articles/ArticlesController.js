const express = require('express');
const router = express.Router();
const Category = require('../categories/Category');
const Article = require('./Article');
const slugify = require('slugify');
const adminAuth = require('../middlewares/adminAuth');

router.get('/admin/articles',adminAuth, (req, res) => {
    Article.findAll({
        include: [{ model: Category }]
    }).then((articles) => {
        res.render('admin/articles/index', { articles })
    })
})

router.get('/admin/articles/new',adminAuth, (req, res) => {
    Category.findAll().then((categories) => {
        res.render('admin/articles/new', { categories })
    })
})

router.post('/articles/save',adminAuth, (req, res) => {
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;
    Article.create({
        title: title,
        slug: slugify(title),
        body: body,
        categoryId: category,
    }).then(() => {
        res.redirect('/admin/articles')
    })
})


router.post('/articles/delete',adminAuth, (req, res) => {
    var id = req.body.id;
    if (id != undefined) {
        if (id != isNaN(id)) {
            Article.destroy({
                where: { id: id }
            }).then(() => {
                res.redirect('/admin/articles')
            })
        } else {
            res.redirect('/admin/articles')
        }
    } else {
        res.redirect('/admin/articles')
    }
})

router.get('/admin/articles/edit/:id',adminAuth, (req, res) => {
    var id = req.params.id;
    Article.findByPk(id).then((article) => {
        if (article != undefined) {
            Category.findAll().then((categories) => {
                res.render('admin/articles/edit', { categories, article })
            })
        } else {
            res.redirect('/')
        }
    }).catch(error => {
        res.redirect('/')
    })
})

router.post('/articles/update',adminAuth, (req, res) => {
    var id = req.body.id;
    var title = req.body.title;
    var body = req.body.body;
    var category = req.body.category;
    Article.update({ title: title, body: body, categoryId: category, slug: slugify(title) },
        {
            where: { id: id }
        }).then(() => {
            res.redirect('/admin/articles')
        }).catch(error => {
            res.redirect('/')
        })
})

router.get('/articles/page/:num', (req, res) => {
    var page = req.params.num;
    var offset = 0;
    if (isNaN(page) || page == 1) {
        var offset = 0;
    } else {
        offset = (parseInt(page)-1) * 3;//3 numero de post por pagina
    }

    Article.findAndCountAll({
        limit: 3,
        offset: offset,
        order: [['id', 'desc']]
    }).then(articles => {
        var next;
        if (offset + 3 >= articles.count) {
            next = false;
        } else {
            next = true;
        }
        var result = { next: next, articles: articles, page:parseInt(page) }
        Category.findAll().then(categories => {
            res.render('admin/articles/page', { result, categories })
        })

    })
})
module.exports = router;

