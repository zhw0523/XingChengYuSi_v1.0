# coding=utf-8
import os
import sys

if __name__ == '__main__':
    os.system("python manager.py runserver -h {} -p {} -d --threaded".format(sys.argv[1],sys.argv[2]))