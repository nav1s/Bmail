package com.example.bmail;

import androidx.room.Entity;
import androidx.room.PrimaryKey;

import java.util.List;

@Entity
public class Mail {
    @PrimaryKey
    public int id;
    public String subject;
    public String body;
    public String sender;
    public List<String> recipients;
    public Boolean draft;
}
