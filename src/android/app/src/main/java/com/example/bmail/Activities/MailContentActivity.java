package com.example.bmail.Activities;

import android.os.Bundle;
import android.util.Log;
import android.widget.ImageButton;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.lifecycle.LiveData;

import com.example.bmail.Entities.BmailApplication;
import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.R;
import com.example.bmail.Repositories.LabelRepository;
import com.example.bmail.Repositories.MailRepository;

import java.util.List;
import java.util.Objects;

public class MailContentActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // todo add viewmodel
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_mail_content);

        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        // fetch the mail id from intent extras
        String mailId = getIntent().getStringExtra("mail_id");
        if (mailId != null && mailId.isEmpty()) {
            Log.e("MailContentActivity", "Invalid mail ID");
            finish();
            return;
        }
        MailRepository mailRepository = BmailApplication.getInstance().getMailRepository();
        LabelRepository labelRepository = BmailApplication.getInstance().getLabelRepository();

        ServerMail mail = mailRepository.getMailById(mailId);
        if (mail == null) {
            Log.e("MailContentActivity", "Mail not found for ID: " + mailId);
            finish();
            return;
        }

        TextView tvMailTitle = findViewById(R.id.tv_mail_title);
        TextView tvSender = findViewById(R.id.tv_sender_name);
        TextView tvRecipients = findViewById(R.id.tv_recipients);
        TextView tvMailBody = findViewById(R.id.tv_mail_body);

        tvMailTitle.setText(mail.getTitle());
        tvSender.setText(mail.getFrom());
        tvRecipients.setText(String.join(", ", mail.getTo()));
        tvMailBody.setText(mail.getBody());

        LiveData<List<Label>> labels = labelRepository.getLabels();
        String starredId = "";
        // print all of the labels
        for (Label label : Objects.requireNonNull(labels.getValue())) {
            Log.d("MailContentActivity", "Label: " + label);
            if (label.isDefault() && label.getName().equalsIgnoreCase("starred")) {
                starredId = label.getId();
            }
        }

        List<String> mailLabels = mail.getLabels();
        ImageButton btnStar = findViewById(R.id.btn_star);
        Log.d("MailContentActivity", "Starred ID: " + starredId);
        Log.d("MailContentActivity", "Mail Labels: " + mailLabels);
        if (mailLabels.contains(starredId)) {
            Log.d("MailContentActivity", "Mail is starred");
            // if the mail is starred, set the star icon to filled
            btnStar.setImageResource(R.drawable.ic_star);
        } else {
            Log.d("MailContentActivity", "Mail is not starred");
            // if the mail is not starred, set the star icon to empty
            btnStar.setImageResource(R.drawable.ic_star_filled);
        }


        // setup delete button
        ImageButton btnDelete = findViewById(R.id.btn_delete);
        btnDelete.setOnClickListener(v -> {
            finish();
        });
    }

    @Override
    public boolean onSupportNavigateUp() {
        finish();
        return true;
    }
}
