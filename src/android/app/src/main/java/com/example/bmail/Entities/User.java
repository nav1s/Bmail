package com.example.bmail.Entities;

import androidx.annotation.NonNull;

public class User {
    private String firstName;
    private String lastName;
    private String username;
    private String image;

    @NonNull
    @Override
    public String toString() {
        return "User{" +
                "firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", username='" + username + '\'' +
                ", image='" + image + '\'' +
                '}';
    }

    public User(String firstName, String lastName, String username, String profilePictureUrl) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.username = username;
        this.image = profilePictureUrl;
    }

    public User() {

    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
}
