'use strict';
const compress = require('koa-compress');
const logger = require('koa-logger');
const serve = require('koa-static');
const route = require('koa-route');
const session = require('koa-session');

const koa = require('koa');
const path = require('path');
const app = module.exports = koa();

// Logger
app.use(logger());

// Session
app.keys = ['0123456789'];
app.use(session(app));

const routes = require('./controllers/routes');

const SUPER_USER = 0;
const NORMAL_USER = 65535;

app.use(route.get('/', routes.home));

app.use(route.get('/users', checkLogin(SUPER_USER)));
app.use(route.get('/users', routes.users)); // 列出所有用户

app.use(route.get('/user/:username', checkPrivilege));
app.use(route.get('/user/:username', routes.user)); // 显示用户信息
app.use(route.post('/user/:username/edit', checkPrivilege));
app.use(route.post('/user/:username/edit', routes.editUser));

app.use(route.get('/adduser', checkLogin(SUPER_USER)));
app.use(route.get('/adduser', routes.addUser));
app.use(route.post('/adduser', checkLogin(SUPER_USER)));
app.use(route.post('/adduser', routes.addUser));


app.use(route.get('/books', checkLogin(NORMAL_USER)));
app.use(route.get('/books', routes.listBook));

app.use(route.get('/addbook', checkLogin(NORMAL_USER)));
app.use(route.get('/addbook', routes.addBook));
app.use(route.get('/addbook/:book_id', checkLogin(NORMAL_USER)));
app.use(route.get('/addbook/:book_id', routes.addBook));


app.use(route.post('/addbook', checkLogin(NORMAL_USER)));
app.use(route.post('/addbook', routes.doAddBook));

app.use(route.get('/book/:book_id', checkLogin(NORMAL_USER)));
app.use(route.get('/book/:book_id', routes.book));
app.use(route.post('/book/:book_id/edit', checkLogin(NORMAL_USER)));
app.use(route.post('/book/:book_id/edit', routes.editBook));

app.use(route.get('/purchaselist', checkLogin(NORMAL_USER)));
app.use(route.get('/purchaselist', routes.showPurchaseList));


app.use(route.get('/buybooks', checkLogin(NORMAL_USER)));
app.use(route.get('/buybooks', routes.buybooks));

app.use(route.post('/buy/:book_id', checkLogin(NORMAL_USER)));
app.use(route.post('/buy/:book_id', routes.buy));

app.use(route.get('/pay/:book_id', checkLogin(NORMAL_USER)));
app.use(route.get('/pay/:book_id', routes.pay));

app.use(route.get('/cancel/:book_id', checkLogin(NORMAL_USER)));
app.use(route.get('/cancel/:book_id', routes.cancelOrder));
app.use(route.get('/add-to-inventory/:book_id', routes.addToInventory));

app.use(route.get('/bill', checkLogin(NORMAL_USER)));
app.use(route.get('/bill', routes.showBill));


app.use(route.post('/querytime', checkLogin(NORMAL_USER)));
app.use(route.post('/querytime', routes.queryTime));

app.use(route.get('/login', checkNotLogin));
app.use(route.get('/login', routes.login));
app.use(route.post('/login', checkNotLogin));
app.use(route.post('/login', routes.login));

app.use(route.get('/logout', checkLogin(NORMAL_USER)));
app.use(route.get('/logout', routes.logout));

// Serve static files
app.use(serve(path.join(__dirname, 'public')));

// Compress
app.use(compress());

if (!module.parent) {
  app.listen(3000);
  console.log('listening on port 3000');
}

function *checkNotLogin(next) {
	if (!this.session || !this.session.user)
		return yield next;
	else this.message = 'You should not logged in.';
}

function checkLogin() {
	let privilege = typeof arguments[0] == 'object' ? 65535 : arguments[0];
	return function * () {
		let next = arguments[arguments.length - 1];
		if (this.session && this.session.user) {
			if (this.session.user.uid <= privilege)
				return yield next;
			else this.message = 'You don\'t have the privilege.';
		}
		else this.message = 'You should logged in.'; //this.throw(403, 'You should logged in');
	}
}

function *checkPrivilege(username, next) {
	if (this.session && this.session.user && (this.session.user.username == username || this.session.user.uid == 0))
		return yield next;
	else this.message = 'You don\'t have the privilege.'
}
