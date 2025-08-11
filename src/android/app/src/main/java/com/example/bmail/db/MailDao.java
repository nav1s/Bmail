package com.example.bmail.db;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.Query;
import androidx.room.Update;

import com.example.bmail.Entities.ServerMail;

import java.util.List;

@Dao
public interface MailDao {
    @Query("SELECT * from ServerMail")
    List<ServerMail> getAllMails();
    @Query("SELECT * from ServerMail WHERE id = :id")
    ServerMail getById(int id);

    @Insert
    void insert(ServerMail mail);
    @Update
    void update(ServerMail mail);
    @Delete
    void delete(ServerMail mail);
    // delete all mails
    @Query("DELETE FROM ServerMail")
    void clear();

    @Insert
    void insertList(List<ServerMail> mails);


}
