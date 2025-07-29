package com.example.bmail.Activities;

import android.os.Bundle;
import android.util.Log;

import androidx.appcompat.app.AppCompatActivity;

import com.example.bmail.Entities.Mail;
import com.example.bmail.R;

public class MailContentActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail_content);

//        Mail mail = getIntent().getParcelableExtra("mail");
//        if (mail == null) {
//            Log.e("MailContentActivity", "Received mail is null");
//            return;
//        }
//        // log the mail title for debugging
//        Log.i("MailContentActivity", "Received mail: " + mail.getTitle());
    }
}
