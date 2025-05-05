#!/usr/bin/env python3
from time import sleep
import socket
import sys

def main(dest_ip, dest_port):
    # try to connect to our socket
    while 1:
        try:
            # create a new socket
            s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            # connect to the ip and the port
            s.connect((dest_ip, dest_port))
            break
        except ConnectionRefusedError:
            sleep(0.5)

    # ask for the user to type a message
    msg = input()
    # loop until the user types quit
    while 1:
        # send the message to the server
        s.send(bytes(msg+'\n', 'utf-8'))
        # save the response the server gave us
        data = s.recv(1024)
        # print the response we got from the server
        print(data.decode('utf-8'))
        # ask for the user to enter a new message
        msg = input()

    s.close()

if __name__ == "__main__":
    # setup the destination ip
    dest_ip = sys.argv[1]
    # setup the destination port
    dest_port = int(sys.argv[2])

    main(dest_ip, dest_port)