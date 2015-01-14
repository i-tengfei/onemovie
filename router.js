var mongoose = require('mongoose'),
    request = require('request'),
    crawler = require('./crawler'),
    async = require('async');

var MovieModel = mongoose.model('movie');

module.exports = function(app, passport){

    app.get('/auth/oneuser', passport.authenticate('oneuser'));
    app.get('/auth/oneuser/callback', passport.authenticate('oneuser', { failureRedirect: '/login' }), function(req, res) {
        res.redirect('/');
    });

    app.get('/', function(req, res){
        MovieModel.find({}, null, {limit: 40}, function(err, results){
            res.render('movie.jade', {movies: results});
        });
    });

    app.use(function(req, res, next){
        if(req.isAuthenticated()) {
            next();
        } else {
            res.redirect('/auth/oneuser');
        }
    });

    app.get('/add', function(req, res){
        res.render('add.jade', {});
    });

app.get('/qq', function(req, res){
    var token = req.user.token;
    res.send('正在获取');
    crawler.crawlAll['film.qq.com'](function(err, results){
        async.mapLimit(results, 10, function(data, done){
            // data.poster
            async.mapLimit(data.poster, 10, function(url, next){
                request.post('http://localhost:3002/u?url=' + url,
                    {auth: {bearer: token}}, function(err, response, body){
                    if(!err && response.statusCode === 200){
                        next(null, JSON.parse(body)._id);
                    }else{
                        next(new Error());
                    }
                });
            }, function(err, poster){
                var movie = new MovieModel({
                    name: [data.name],
                    view: [{
                        origin: data.origin,
                        url: data.view
                    }],
                    poster: poster,
                    actor: data.actor,
                    director: data.director,
                    description: data.description
                });
                movie.save(function(err, movie){
                    done(err, movie);
                });
            });
        }, function(err, results){
            if(err){
                console.log(err);
            }else{
                console.log('完成');
            }
        });
    });
});
app.post('/add', function(req, res){
    var movie = new MovieModel(req.body);
    movie.save(function(err, movie){
        res.json(movie);
    });
});
app.get('/find', function(req, res){
    crawler.crawl(req.query.url || 'http://film.qq.com/cover/4/49a5yjar93mpa0m.html', function(err, result){
        res.json(result);
    });
});
app.get('/t', function(req, res){
    request.post('http://localhost:3002/u?url=http://img.1985t.com/uploads/attaches/2014/06/15959-rs3jWL.jpg',
        {auth: {bearer: req.user.token}}, function(err, response, body){
        if(!err && response.statusCode === 200){
            res.send('hhh');
        }else{
            res.sendStatus(403);
        }
    });
});

};
