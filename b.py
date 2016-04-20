#coding:utf8

import urllib, urllib2
import os, sys
import re
import random

html = ''

def crawl(tag, start):
    url = r'https://www.douban.com/tag/'+tag+'/book?start='+str(start)

    #print "url = %s\n" % url
    global html
    try:
        html = urllib2.urlopen(url).read()[:40000]
    except urllib2.HTTPError, e:
        return

    pat = re.compile('/\d{7,9}/')
    
    numbers = pat.findall(html)
    n = len(numbers)
    for i in range(0,n,2):
        print numbers[i][1:-1]
        fout.write(numbers[i][1:-1]+'\n')


if __name__ == '__main__':

    fin = open("tags.txt", "r")
    tags = []
    for i in fin.readlines():
        tags.append(i[:-1])

    fout = open("books.txt", "a")

    for i in range(0, 200, 15):
        for tag in tags:    
            crawl(tag, i)
