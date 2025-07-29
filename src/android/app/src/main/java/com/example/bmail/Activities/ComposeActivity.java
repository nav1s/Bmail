package com.example.bmail.Activities;

import android.os.Bundle;
import android.widget.EditText;
import android.widget.ImageButton;
import androidx.appcompat.app.AppCompatActivity;

import com.example.bmail.R;

public class ComposeActivity extends AppCompatActivity {

    private EditText etTo;
    private ImageButton btnBack, btnSend;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_compose);

        initViews();
        setupListeners();
    }

    private void initViews() {
        etTo = findViewById(R.id.et_to);
        btnBack = findViewById(R.id.btn_back);
        btnSend = findViewById(R.id.btn_send);
    }


    private void setupListeners() {
        btnBack.setOnClickListener(v -> finish());
        btnSend.setOnClickListener(v -> sendEmail());
    }

    private void sendEmail() {
        String to = etTo.getText().toString().trim();

        // Validate input
        if (to.isEmpty()) {
            new androidx.appcompat.app.AlertDialog.Builder(this)
                    .setMessage("Add at least one recipient.")
                    .setPositiveButton("OK", (dialog, which) -> dialog.dismiss())
                    .show();
            return;
        }
        finish();


    }

}
