package com.example.bmail.Activities;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.text.Editable;
import android.text.TextWatcher;
import android.util.Log;
import android.view.Menu;
import android.view.View;
import android.widget.EditText;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.appcompat.app.ActionBarDrawerToggle;
import androidx.appcompat.app.AppCompatActivity;
import androidx.appcompat.widget.Toolbar;
import androidx.drawerlayout.widget.DrawerLayout;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.example.bmail.Entities.Label;
import com.example.bmail.Entities.ServerMail;
import com.example.bmail.ViewModels.MainActivityViewModel;
import com.example.bmail.R;
import com.example.bmail.Adapters.MailsAdapter;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.navigation.NavigationView;

public class MainActivity extends AppCompatActivity {
    // Constants for mail labels
    private static final String LABEL_INBOX = "inbox";

    private DrawerLayout drawer;
    private SwipeRefreshLayout refreshLayout;
    private MainActivityViewModel viewModel;
    private MailsAdapter adapter;
    private NavigationView navigationView;
    private FloatingActionButton fabCompose;
    private ImageButton btnProfile;
    private EditText searchBar;
    private TextView logout;

    // Current label for the mail view
    private String currentLabel = LABEL_INBOX;
    private int labelCounter = 7;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        initViews();
        setupListeners();
    }

    @Override
    protected void onResume() {
        // todo add periodic updates for mails
        super.onResume();
        viewModel.loadUserDetails();
        viewModel.loadLabels();
        viewModel.loadMails(currentLabel);
    }

    /**
     * @brief Initialize the views for the MailActivity.
     * Finds views by their IDs and sets up the toolbar and RecyclerView.
     */
    private void initViews() {
        refreshLayout = findViewById(R.id.swipe_refresh_layout);
        fabCompose = findViewById(R.id.fab_compose);
        drawer = findViewById(R.id.drawer_layout);
        navigationView = findViewById(R.id.nav_view);
        btnProfile = findViewById(R.id.profile_button);
        searchBar = findViewById(R.id.search_edit_text);
        logout = findViewById(R.id.nav_logout);

        setupToolbar();
        setupRecyclerView();
    }

    /**
     * @brief Setup the toolbar for the MailActivity.
     * Initializes the toolbar and sets up the ActionBarDrawerToggle for navigation drawer.
     */
    private void setupToolbar() {
        Toolbar toolbar = findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(
                this, drawer, toolbar,
                R.string.open_drawer, R.string.close_drawer);
        drawer.addDrawerListener(toggle);
        toggle.syncState();
    }

    /**
     * @brief Setup the RecyclerView for displaying mails.
     * Initializes the RecyclerView with a LinearLayoutManager and sets the adapter.
     */
    private void setupRecyclerView() {
        RecyclerView recyclerView = findViewById(R.id.recycler_view);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));
        adapter = new MailsAdapter(this, this::showMailContent);
        recyclerView.setAdapter(adapter);
    }

    /**
     * @brief Setup listeners for the MailActivity.
     * Initializes ViewModel, sets up click listeners, navigation listener,
     * search listener, and custom menu item.
     */
    private void setupListeners() {
        setupViewModel();
        setupClickListeners();
        setupNavigationListener();
        setupSearchListener();
        setupCustomLabels();
    }

    /**
     * @brief Setup the ViewModel for the MailActivity.
     * Initializes the MailViewModel and observes the mails LiveData.
     * Updates the adapter when new mails are received.
     */
    private void setupViewModel() {
        viewModel = new MainActivityViewModel();

        viewModel.getMails().observe(this, mails -> {
            if (mails != null) {
                adapter.setMails(mails);
                refreshLayout.setRefreshing(false);
            }
        });

        viewModel.getUserData().observe(this, user -> {
            if (user != null) {
                Log.i("MainActivity", "User data loaded: " + user);
                ImageView profileImage = findViewById(R.id.profile_image);
                viewModel.getImage(user.getImage(), new retrofit2.Callback<>() {
                    @Override
                    public void onResponse(@NonNull retrofit2.Call<okhttp3.ResponseBody> call, @NonNull retrofit2.Response<okhttp3.ResponseBody> response) {
                        if (response.isSuccessful() && response.body() != null) {
                            profileImage.setImageBitmap(BitmapFactory.decodeStream(response.body().byteStream()));
                        } else {
                            Log.e("MainActivity", "Failed to load profile image: " + response.message());
                        }
                    }

                    @Override
                    public void onFailure(@NonNull retrofit2.Call<okhttp3.ResponseBody> call, @NonNull Throwable t) {
                        Log.e("MainActivity", "Error loading profile image", t);
                    }
                });
                // Update UI with user data if needed
            } else {
                Log.w("MainActivity", "User data is null.");
            }
        });

    }

    /**
     * @brief Setup click listeners for various UI elements.
     * Handles compose button, refresh layout, profile button, and logout button.
     */
    private void setupClickListeners() {
        fabCompose.setOnClickListener(v -> {
            Intent intent = new Intent(this, ComposeActivity.class);
            intent.putExtra("currentLabel", currentLabel);
            startActivity(intent);
        });

        refreshLayout.setOnRefreshListener(() -> {
            viewModel.loadLabels();
            viewModel.loadMails(currentLabel);
            refreshLayout.setRefreshing(true);
        });

        btnProfile.setOnClickListener(v -> {
            Intent intent = new Intent(this, ProfileActivity.class);
            startActivity(intent);
        });

        logout.setOnClickListener(v -> showLogoutDialog());
    }

    /**
     * @brief Setup a listener for the navigation drawer.
     * Changes the label based on the selected item and loads mails accordingly.
     */
    private void setupNavigationListener() {
        navigationView.setNavigationItemSelectedListener(item -> {
            drawer.closeDrawers();

//            int itemId = item.getItemId();
//            if (itemId == R.id.nav_add_label) {
//                Log.i("MailActivity", "Add label clicked, opening AddLabelActivity.");
//                // todo create a dialog that asks for the label name
//                return false;
//            }

            this.currentLabel = (String) item.getTitle();
            Log.i("MailActivity", "Custom label selected: " + this.currentLabel);

            viewModel.loadMails(this.currentLabel);
            return true;
        });
    }

    /**
     * @brief Setup a listener for the search bar.
     * Logs the search text when it changes.
     */
    private void setupSearchListener() {
        searchBar.addTextChangedListener(new TextWatcher() {
            @Override
            public void beforeTextChanged(CharSequence s, int start, int count, int after) {
            }

            @Override
            public void onTextChanged(CharSequence s, int start, int before, int count) {
                String searchText = s.toString().trim();
                if (searchText.isEmpty()) {
                    viewModel.loadMails(currentLabel);
                } else {
                    Log.i("MailActivity", "Searching for mails with text: " + searchText);
                    viewModel.searchMail(searchText);
                }
            }

            @Override
            public void afterTextChanged(Editable s) {
            }
        });
    }

    private void setupCustomLabels() {
        Menu menu = navigationView.getMenu();

        viewModel.loadLabels().observe(this, labels -> {
            if (labels == null) {
                Log.w("MailActivity", "Labels are null, cannot setup custom labels.");
                return;
            }

            Log.i("MailActivity", "Labels loaded: " + labels.size());
            for (Label label : labels) {
                if (!label.isDefault()) {
                    Log.i("MailActivity", "Found non default: " + label.getName());
//                    if (menu.findItem(label.getId()) != null) {
//                        Log.w("MailActivity", "Label already exists in menu: "
//                                + label.getName());
//                        continue;
//                    }

                    Log.i("MailActivity", "Adding custom label to menu: "
                            + label.getName());
                    menu.add(R.id.nav_custom_labels, this.labelCounter, this.labelCounter, label.getName())
                            .setIcon(R.drawable.ic_label)
                            .setCheckable(true);
                    this.labelCounter++;
                }
            }
        });
    }

    /**
     * @brief Show a dialog to confirm logout.
     * If confirmed, clears user preferences and redirects to the login activity.
     */
    private void showLogoutDialog() {
        new androidx.appcompat.app.AlertDialog.Builder(this)
                .setTitle("Logout")
                .setMessage("Are you sure you want to logout?")
                .setPositiveButton("Yes", (dialog, which) -> performLogout())
                .setNegativeButton("Cancel", (dialog, which) -> dialog.dismiss())
                .show();
    }

    /**
     * @brief Perform the logout operation.
     * Clears user preferences and redirects to the login activity.
     */
    private void performLogout() {
        SharedPreferences preferences = getSharedPreferences("user_prefs", Context.MODE_PRIVATE);
        preferences.edit().clear().apply();

        Intent intent = new Intent(this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
        finish();
    }

    /**
     * @param view The view that was clicked, containing the mail data.
     * @brief Show the content of the clicked mail.
     */
    private void showMailContent(@NonNull View view) {
        ServerMail clickedMail = (ServerMail) view.getTag();
        if (clickedMail == null) {
            Log.w("MailActivity", "Clicked mail is null, cannot show content.");
            return;
        }
        Log.i("MailActivity", "Clicked mail: " + clickedMail.getTitle());
        Intent intent;
        // check if the mail is a draft
        if (clickedMail.getDraft()) {
            Log.i("MailActivity", "Clicked mail is a draft, opening ComposeActivity.");
            intent = new Intent(this, ComposeActivity.class);
        } else{
            Log.i("MailActivity", "Clicked mail is not a draft, opening MailContentActivity.");
            intent = new Intent(this, MailContentActivity.class);
        }

        intent.putExtra("mail_id", clickedMail.getId());
        startActivity(intent);
    }

}
