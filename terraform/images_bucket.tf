resource "aws_s3_bucket" "image_bucket" {
    bucket = "neon-bot-images"

    tags = {
        Name = "neon-bot-images"
    }
}

resource "aws_s3_bucket_policy" "bucket_policy" {
  bucket = aws_s3_bucket.image_bucket.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.image_bucket.arn}/*"
      }
    ]
  })
}

resource "aws_s3_bucket_ownership_controls" "bucket_ownership_controls" {
    bucket = aws_s3_bucket.image_bucket.id

    rule {
        object_ownership = "BucketOwnerPreferred"
    }
}

resource "aws_s3_bucket_public_access_block" "access_block" {
  bucket = aws_s3_bucket.image_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = true
  restrict_public_buckets = false
}

resource "aws_s3_bucket_acl" "bucket_acl" {
    depends_on = [
        aws_s3_bucket_ownership_controls.bucket_ownership_controls, 
        aws_s3_bucket_public_access_block.access_block
    ]

    bucket = aws_s3_bucket.image_bucket.id
    acl    = "public-read"
}