#coding:utf8

import urllib, urllib2
import os, sys
import re
import random

html = ''

def init():
    global p_bookname, p_author, p_price1, p_price2, p_press, p_isbn1, p_isbn2, p_img
    p_bookname = re.compile(r'<h1>.*?</h1>', re.S)
    p_author = re.compile(r'作者<.*?</a>', re.S)
    p_price1 = re.compile(r'定价.*?<br')
    p_price2 = re.compile(r'[\d.]+')
    p_press = re.compile(r'出版社.*?<br')
    p_isbn1 = re.compile(r'ISBN.*?<br')
    p_isbn2 = re.compile(r'\d+')
    p_img = re.compile(r'src=.*?点击看大图')

def get_bookname():
    global html
    global p_bookname
    bookname = p_bookname.findall(html)
    if (len(bookname) > 0):
        bookname = bookname[0]
    else:
        return None
    bookname = bookname[bookname[4:].find('>')+5 : bookname.find('</span')]
    return bookname.replace("&#39;", '\'')

def get_author():
    global html
    global p_author
    author = p_author.findall(html)
    if (len(author) > 0):
        author = author[0]
    else:
        return None
    author = author[::-1]
    author = author[author.find('/<'):author[1:].find('>')+1]
    return author[::-1][:-2]

def get_price():
    global html
    global p_price1, p_price2
    price = p_price1.findall(html)
    if (len(price) > 0):
        price = price[0]
    else:
        return None
    price = price[price.find("span") + 6:-3]
    
    isdollor = False
    if (price.find('USD') >= 0 or price.find('$') >= 0):
        isdollor = True
    
    price = p_price2.findall(price)
    if (len(price) > 0):
        price = price[0]
    else:
        return None
    if (isdollor):
        price = float(price) * 6.46613041
        price = round(price, 2)
    return price

def get_press():
    global html
    global p_press
    press = p_press.findall(html)
    if (len(press) > 0):
        press = press[0]
    else:
        return None
    press = press[press.find("span") + 6:-3]
    return press

def get_isbn():
    global html
    global p_isbn1, p_isbn2
    isbn = p_isbn1.findall(html)
    if (len(isbn) > 0):
        isbn = isbn[0]
    else:
        return None
    isbn = p_isbn2.findall(isbn)
    if (len(isbn) > 0):
        isbn = isbn[0]
    else:
        return None
    return isbn

def get_img():
    global html
    img = p_img.findall(html)
    if (len(img) > 0):
        img = img[0]
    else:
        return None
    return img[5:img[6:].find('"')+6]

def crawl(book_id):
    url = r'https://book.douban.com/subject/' + str(book_id)
    #print "url = %s\n" % url
    global html
    try:
        html = urllib2.urlopen(url).read()[:40000]
    except urllib2.HTTPError, e:
        return

    book = {}

    book['book_id'] = book_id
    book['isbn'] = get_isbn()
    book['name'] = get_bookname()
    book['press'] = get_press()
    book['author'] = get_author()
    book['price'] = get_price()
    book['img'] = get_img()

    isout = True
    for i in book:
        if (book[i] == None):
            isout = False
            break
        if (str(book[i]).find("'") >= 0):
            isout = False
    if (isout):
        os.system("mysql test -e \"insert into inventory values('"+str(book['book_id'])+"',\
                "+"'"+book['isbn']+"',"+"'"+book['name']+"',"+"'"+book['press']+"',"+"'"+book['author']+"',\
                "+str(book['price'])+",100,"+"'"+book['img']+"')\"")


if __name__ == '__main__':
    init()

    fin = open("books.txt", "r")
    begin = False
    for i in fin.readlines():
        print i[:-1]
        if (i[:-1] == "3577344"):
            begin = True
        if begin:
            crawl(i[:-1])
