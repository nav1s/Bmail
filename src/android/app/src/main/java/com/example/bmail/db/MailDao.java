package com.example.bmail.db;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import com.example.bmail.Entities.Mail;

import java.util.List;

@Dao
public interface MailDao {
    @Query("SELECT * from mail")
    List<Mail> getAllMails();
    @Query("SELECT * from mail WHERE id = :id")
    Mail getById(int id);

    @Insert
    void insert(Mail mail);
    @Update
    void update(Mail mail);
    @Delete
    void delete(Mail mail);
    // delete all mails
    @Query("DELETE FROM mail")
    void clear();

    @Insert
    void insertList(List<Mail> mails);


}
