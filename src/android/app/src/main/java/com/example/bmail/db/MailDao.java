package com.example.bmail.db;

import androidx.room.Dao;
import androidx.room.Delete;
import androidx.room.Insert;
import androidx.room.OnConflictStrategy;
import androidx.room.Query;
import androidx.room.Update;

import com.example.bmail.Entities.ServerMail;

import java.util.List;

@Dao
public interface MailDao {
    @Query("SELECT * from ServerMail")
    List<ServerMail> getAllMails();
    @Query("SELECT * from ServerMail WHERE id = :id")
    ServerMail getById(String id);

    @Update
    void update(ServerMail mail);

    @Query("DELETE FROM ServerMail WHERE id = :id")
    void deleteById(String id);
    // delete all mails
    @Query("DELETE FROM ServerMail")
    void clear();

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    void insertList(List<ServerMail> mails);

    @Query("UPDATE ServerMail SET labels = :labels WHERE id = :mailId")
    void updateMailLabels(String mailId, List<String> labels);
}
