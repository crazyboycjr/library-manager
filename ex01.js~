var co = require('co'),
	wrapper = require('co-mysql'),
	mysql = require('mysql');

var options = {
	host		: 'localhost',
	user		: 'testuser',
	password	: '',
	database	: 'test'
};

var pool = mysql.createPool(options),
	p = wrapper(pool);

co(function *() {
	var rows = yield p.query('select * from users where username=\'123\'');
	console.log(rows);
	pool.end();
})();


/*
var connection = mysql.createConnection(options);

connection.query('select * from users', function(err, rows, fields) {
	if (err) throw err;

	console.log('The solution is: ', rows, fields);
});

connection.end();
*/
