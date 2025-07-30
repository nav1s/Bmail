package com.example.bmail.db;

import androidx.room.Database;
import androidx.room.RoomDatabase;

import com.example.bmail.Entities.Mail;

@Database(entities = {Mail.class}, version = 1)
public abstract class AppDatabase extends RoomDatabase {
    public abstract MailDao mailDao();
}
