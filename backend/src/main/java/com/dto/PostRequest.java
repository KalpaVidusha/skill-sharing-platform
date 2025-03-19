package com.dto;

public class PostRequest {
    @NotBlank
    private String description;

    @Size(max = 3, message = "Maximum 3 media files allowed")
    private List<MediaRequest> media;

    public static class MediaRequest {
        @NotBlank
        private String url;

        @Pattern(regexp = "image|video", message = "Invalid media type")
        private String type;

        @Min(1) @Max(30)
        private Integer duration;
    }
}