import multer from 'multer';

const storage = multer.diskStorage({ // use to store file in local storage(server)
    destination: function (req, file, cb) {
        cb(null, './public/temp');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.filename + '-' + uniqueSuffix);
    }
})

const upload = multer({ storage: storage });