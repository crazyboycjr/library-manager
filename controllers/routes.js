'use strict';
const views = require('co-views');
const parse = require('co-body');

const render = views(__dirname + '/../views', {
	map: { html: 'swig' }
});

const co 		= require('co');
const wrapper 	= require('co-mysql');
const mysql 	= require('mysql');
const bcrypt 	= require('bcrypt-nodejs');

const options = {
	host		: 'localhost',
	user		: 'testuser',
	password	: '',
	database	: 'test'
};

const Pool = wrapper(mysql.createPool(options));
const pool = wrapper(Pool);

module.exports.home = function *home() {
	console.log(this.session);
	if (this.session.user)
		this.body = yield render('home', { ctx : this });
	else
		this.redirect('/login');
}

module.exports.users = function *users() {
	let users = yield pool.query('select * from users where uid > 0');
	this.body = yield render('users', { ctx : this, users : users });
}

module.exports.login = function *login() {
	console.log(this.request.method);
	if (this.request.method == 'GET')
		this.body = yield render('login');
	else {
		let post = yield parse(this);
		//console.log(post);
		// TODO: too unsafe!!!
		let rows = yield pool.query(`
				select * from users
				where username = \'${post.username}\'
				`);
		//console.log(rows);
		if (rows.length == 0) this.throw(403, 'username does not exist');
		else if (!bcrypt.compareSync(post.passwd, rows[0].passwd)) this.throw(403, 'wrong password');
		else {
			this.session.user = rows[0];
			this.redirect('/');
		}
	}
}


module.exports.logout = function *logout() {
	this.session.user = null;
	this.redirect('/');
}

module.exports.addUser = function *addUser() {
	if (this.request.method == 'GET')
		this.body = yield render('adduser', { ctx : this });
	else {
		let post = yield parse(this);
		let rows = yield pool.query(`select max(uid) as ret from users`);
		post.uid = rows[0].ret + 1;
		post.passwd = bcrypt.hashSync(post.passwd);
		//console.log(post);
		// TODO: too unsafe!!!
		console.log(`
				insert into users
				values(${post.uid}, \'${post.username}\', \'${post.passwd}\',
					\'${post.realname}\', \'${post.job_id}\',
					\'${post.gender}\', ${post.age})
				`);
		let result = yield pool.query(`
				insert into users
				values(${post.uid}, \'${post.username}\', \'${post.passwd}\',
					\'${post.realname}\', \'${post.job_id}\',
					\'${post.gender}\', ${post.age})
				`);
		console.log(result);
		// here can use flash
		this.redirect('/users');
	}
}

module.exports.user = function *user(username) {
	console.log(username);
	let rows = yield pool.query(`select * from users where username = \'${username}\'`);
	
	this.body = yield render('user', { ctx : this, user : rows[0] });
}


module.exports.editUser = function *editUser(username, next) {
	console.log(username);
	if (this.method != 'POST') yield next;
	let post = yield parse(this);
	let rows = yield pool.query(`select * from users where username = \'${username}\'`);
	if (rows == 0) {
		this.message = 'Non such user exist.';
	} else {
		console.log(post['old-passwd']);
		console.log(rows[0].passwd);
		if (!bcrypt.compareSync(post['old-passwd'], rows[0].passwd) && this.session.user.uid > 0) {
			this.message = 'wrong password.';
			return;
		}
		
		post.passwd = bcrypt.hashSync(post.passwd);
		for (let name in rows[0]) {
			console.log(name, post[name]);
			if (post[name] == null) continue;
			if (name == 'uid') continue;
			if (name != 'username' || (name == 'username' && this.session.user.uid == 0)) {
				yield pool.query(`
						update users
						set ${name} = \'${post[name]}\'
						where username = \'${username}\'
						`);
				if (name == 'username')
					username = post[name];
			}
		}
		if (this.session.user.uid == 0)
			this.redirect('/users');
		else this.redirect('/');
	}
}


module.exports.listBook = function *listBooks() {
	let books = yield pool.query('select * from inventory');
	this.body = yield render('books', { ctx : this, inventory : books });
}

module.exports.buybooks = function *buybooks() {
	let books = yield pool.query('select * from inventory where count > 0');
	this.body = yield render('buybooks', { ctx : this, inventory : books });
}


module.exports.addBook = function *addBook(book_id) {
	console.log(book_id);
	if (book_id >= 0) {
		let rows = yield pool.query(`select * from inventory where book_id = ${book_id}`);
		if (!(rows.length == 0)) {
			this.body = yield render('addbook', { ctx : this, book : rows[0], newBook : rows[0] })
		}
	} else {
		let rows = yield pool.query(`select * from inventory where book_id = (select max(book_id) from inventory)`);
		if (!(rows.length == 0)) {
			this.body = yield render('addbook', { ctx : this, book : rows[0] })
		}
	}
}

module.exports.doAddBook = function *doAddBook() {
	let post = yield parse(this);
	console.log(post);
	if (post.isbn != undefined) {
		post.isbn = post.isbn.replace(/-/g, '');
	}
	//let rows = yield pool.query(`select max(id) as ret from purchase_list`);
	//post.id = rows[0].ret == null ? 0 : rows[0].ret + 1;
	//console.log(post.id);
	post['status'] = '未付款';

	let rows = yield pool.query(`select date_format(now(), '%Y-%m-%d %T') as ret`);
	post.create_time = rows[0].ret;
	console.log(post.create_time);

	console.log(`
			insert into purchase_list
			values(\'${post.book_id}\', \'${post.isbn}\', \'${post.name}\',
				\'${post.press}\', \'${post.author}\', ${post.cost_price},
				${post.buying_count}, \'${post.status}\', \'${post.create_time}\', null)
			`);
	let result = yield pool.query(`
			insert into purchase_list
			values(\'${post.book_id}\', \'${post.isbn}\', \'${post.name}\',
				\'${post.press}\', \'${post.author}\', ${post.cost_price},
				${post.buying_count}, \'${post.status}\', \'${post.create_time}\', null)
			`);
	console.log(result);
	this.redirect('/purchaselist');
}

module.exports.showPurchaseList = function *showPurchaseList() {
	let rows = yield pool.query(`select * from purchase_list`);
	for (let i = 0; i < rows.length; i++)
		rows[i].create_time = rows[i].create_time.toLocaleString();
	console.log(rows[0].create_time);
	this.body = yield render( 'purchaselist', { ctx : this, purchase_list : rows });
}



module.exports.pay = function *pay(id, next) {
	console.log(id);
	let rows = yield pool.query(`select * from purchase_list where id = ${id}`);
	// check if empty object;
	if (!(rows.length == 0)) {
		// TODO:consider more conditions?
		let tmp = yield pool.query(`select date_format(now(), '%Y-%m-%d %T') as ret`);
		console.log(tmp[0]);
		console.log(`
				insert into bill
				values(\'${tmp[0].ret}\', -${rows[0].cost_price} * ${rows[0].buying_count}, \'${rows[0].book_id}\', ${rows[0].buying_count},
					\'${this.session.user.username}\')
				`);
		yield pool.query(`
				insert into bill
				values(\'${tmp[0].ret}\', -${rows[0].cost_price} * ${rows[0].buying_count}, \'${rows[0].book_id}\', ${rows[0].buying_count},
					\'${this.session.user.username}\')
				`);
		yield pool.query(`update purchase_list set status = '已付款' where id = ${id}`);
	}
	this.redirect('/purchaselist');
}

module.exports.cancelOrder = function *cancelOrder(id) {
	console.log(id);
	let rows = yield pool.query(`select * from purchase_list where id = ${id}`);
	// check if empty object;
	if (!(rows.length == 0)) {
		yield pool.query(`update purchase_list set status = '已退货' where id = ${id}`);
	}
	this.redirect('/purchaselist');
}

module.exports.buy = function *buy(book_id, next) {
	console.log(book_id);
	let post = yield parse(this);
	console.log(post);
	let rows = yield pool.query(`select * from inventory where book_id = ${book_id}`);
	post.count = Number(post.count);
	console.log(rows[0].count, post.count);
	if (rows[0].count >= post.count) {
		rows[0].count -= post.count;
	} else {
		this.message = "There are no enough books in the inventory."
		return yield next;
	}
	console.log(rows[0]);
	// check if empty object;
	if (!(rows.length == 0)) {
		// TODO:consider more conditions?
		let tmp = yield pool.query(`select date_format(now(), '%Y-%m-%d %T') as ret`);
		console.log(tmp[0]);
		console.log(`
				insert into bill
				values(\'${tmp[0].ret}\', ${rows[0].retail_price} * ${post.count}, \'${rows[0].book_id}\', ${post.count},
					\'${this.session.user.username}\')
				`);
		yield pool.query(`
				insert into bill
				values(\'${tmp[0].ret}\', ${rows[0].retail_price} * ${post.count}, \'${rows[0].book_id}\', ${post.count},
					\'${this.session.user.username}\')
				`);
		yield pool.query(`update inventory set count = ${rows[0].count} where book_id = ${book_id}`);
	}
	//TODO: flash a success message
	this.redirect('/buybooks');
}


module.exports.addToInventory = function *addToInventory(id) {
	console.log(id);
	let rows = yield pool.query(`select * from purchase_list where id = ${id}`);
	if (!(rows.length == 0)) {
		let book = yield pool.query(`select * from inventory where book_id = ${rows[0].book_id}`);
		console.log(book);
		if (book.length == 0) {
			console.log(`
					insert into inventory
					values(\'${rows[0].book_id}\', \'${rows[0].isbn}\', \'${rows[0].name}\',
						\'${rows[0].press}\', \'${rows[0].author}\', ${rows[0].cost_price},
						\'${rows[0].buying_count}\', null)
					`);
			yield pool.query(`
					insert into inventory
					values(\'${rows[0].book_id}\', \'${rows[0].isbn}\', \'${rows[0].name}\',
						\'${rows[0].press}\', \'${rows[0].author}\', ${rows[0].cost_price},
						\'${rows[0].buying_count}\', null)
					`);
		} else {
			console.log(`
					update inventory
					set count = count + ${rows[0].buying_count}
					where book_id = ${rows[0].book_id}
					`);
			yield pool.query(`
					update inventory
					set count = count + ${rows[0].buying_count}
					where book_id = ${rows[0].book_id}
					`);
		}

		yield pool.query(`update purchase_list set status = '已添加至库存' where id = ${id}`);
	}
	this.redirect('/purchaselist');
}

module.exports.book = function *listBook(book_id) {
	let book = yield pool.query(`select * from inventory where book_id = \'${book_id}\'`);
	this.body = yield render('/book', { ctx : this, book : book[0] });
}

module.exports.editBook = function *editBook(book_id) {
	let post = yield parse(this);
	let rows = yield pool.query(`select * from inventory where book_id = \'${book_id}\'`);
	if (!(rows.length == 0)) {
		console.log(`
				update inventory
				set name = \'${post.name}\', press = \'${post.press}\',
				author = \'${post.author}\', retail_price = \'${post.retail_price}\'
				where book_id = \'${book_id}\'
				`);
		yield pool.query(`
				update inventory
				set name = \'${post.name}\', press = \'${post.press}\',
				author = \'${post.author}\', retail_price = \'${post.retail_price}\'
				where book_id = \'${book_id}\'
				`);
	}
	this.redirect('/books');
}


module.exports.showBill = function *showBill() {
	let rows = yield pool.query(`select * from bill natural join inventory`);
	for (let i = 0; i < rows.length; i++)
		rows[i].buying_time = rows[i].buying_time.toLocaleString();
	this.body = yield render('/bill', { ctx : this, bill : rows });
}

module.exports.queryTime = function *queryTime() {
	let post = yield parse(this);
	console.log(post);
	let rows;
	if (post.start.length == 0 && post.end.length == 0) {
		rows = yield pool.query(`select * from bill natural join inventory`);
	} else if (post.start.length == 0) {
		rows = yield pool.query(`select * from bill natural join inventory where buying_time <= \'${post.end}\'`);
	} else if (post.end.length == 0) {
		rows = yield pool.query(`select * from bill natural join inventory where buying_time >= \'${post.start}\'`);
	} else {
		rows = yield pool.query(`select * from bill natural join inventory where buying_time >= \'${post.start}\' and buying_time <= \'${post.end}\'`);
	}
	console.log(rows);
	for (let i = 0; i < rows.length; i++)
		rows[i].buying_time = rows[i].buying_time.toLocaleString();
	this.body = yield render('/bill', { ctx : this, bill : rows });
}






/*
co(function *() {
	let rows = yield pool.query('select * from users');
	console.log(rows);
	Pool.end();
})();
*/
/*
module.exports.home = function *home(ctx) {
  this.body = yield render('list', { 'messages': messages });
};

module.exports.list = function *list() {
  this.body = yield messages;
};

module.exports.fetch = function *fetch(id) {
  const message = messages[id];
  if (!message) {
    this.throw(404, 'message with id = ' + id + ' was not found');
  }
  this.body = yield message;
};

module.exports.create = function *create() {
  const message = yield parse(this);
  const id = messages.push(message) - 1;
  message.id = id;
  this.redirect('/');
};

const asyncOperation = () => callback =>
  setTimeout(
    () => callback(null, 'this was loaded asynchronously and it took 2 seconds to complete'),
    2000);

module.exports.delay = function *delay() {
  this.body = yield asyncOperation();
};
*/
