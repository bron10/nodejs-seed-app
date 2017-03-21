module.exports = {
    pagination: {
        skip: 0,
        limit: 10,
        max_limit: 100
    },
    
    images: {
        url: "'https://s3.amazonaws.com/ft-images/shows/'",
        thumb_url: "'https://s3.amazonaws.com/ft-images/shows/thumb_img/'",
        original_url: "'https://s3.amazonaws.com/ft-images/shows/original_image/'",
        venue_logo: "https://s3.amazonaws.com/ft-images/venue_logo/",
        background_image: "https://s3.amazonaws.com/ft-images/background_images/",
        top_logo: "https://s3.amazonaws.com/ft-images/top_logo/",
        gallery_url: "https://s3.amazonaws.com/ft-images/show_gallery/",
        gallery_thumb_url: "https://s3.amazonaws.com/ft-images/show_gallery/",
        gallery_original_url: "https://s3.amazonaws.com/ft-images/show_gallery/",
        show_url: "https://s3.amazonaws.com/ft-images/shows/",
        show_thumb_url: "https://s3.amazonaws.com/ft-images/shows/thumb_img/",
        show_original_url: "https://s3.amazonaws.com/ft-images/shows/original_image/"
    },
    cart: {
        minticketCount: 1,
        maxticketCount: 100,
        transactionLimit: 10
    },
    interfaces: {
        '2': "boxoffice",
        '1': "online"
    },
    companyId: 1,
    questionnaire: {
        exceptions: {
            email_capture_bo: 'email_address'
        }
    },
    gender : ['male', 'female'],
    access_from : ['venue','customer','iphone','portal','presenter'],
    blacklist : {
        delivery_method : ['print']
    },
    delivery_methods : ['print from home', 'will call', 'check in at the door'] 
}
