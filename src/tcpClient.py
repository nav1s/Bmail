#!/usr/bin/env python3
import socket
import sys

# create a new socket
s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
# setup the destination ip
dest_ip = sys.argv[1]
# setup the destination port
dest_port = int(sys.argv[2])

# connect to the ip and the port
s.connect((dest_ip, dest_port))
print("connected to server")

# ask for the user to type a message
msg = input("Message to send: ")
# loop until the user types quit
while not msg == 'quit':
    # send the message to the server
    s.send(bytes(msg, 'utf-8'))
    # save the response the server gave us
    data = s.recv(1024)
    # print the response we got from the server
    print("Server sent: ", data.decode('utf-8'))
    # ask for the user to enter a new message
    msg = input("Message to send: ")

s.close()