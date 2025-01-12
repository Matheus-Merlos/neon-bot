resource "aws_s3_bucket" "images_bucket" {
    bucket = "tf-neon-bot-image-bucket"
    acl    = "public-read"
    
    versioning {
        enabled = true
    }

    tags = {
        Name = "tf-neon-bot-image-bucket"
    }
}

resource "aws_s3_bucket_policy" "images_bucket_policy" {
  bucket = aws_s3_bucket.images_bucket.id

  policy = jsonencode({
    Version = "2012-10-17",
    Statement = [
      {
        Sid       = "PublicReadGetObject",
        Effect    = "Allow",
        Principal = "*",
        Action    = "s3:GetObject",
        Resource  = "${aws_s3_bucket.images_bucket.arn}/*"
      }
    ]
  })
}


resource "tls_private_key" "ssh_key" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

resource "aws_key_pair" "deployer_key" {
  key_name   = "deployer-key"
  public_key = tls_private_key.ssh_key.public_key_openssh
}


resource "aws_security_group" "ec2_security_group" {
  name        = "ec2-ssh-security-group"
  description = "Permite acesso SSH"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_instance" "main_server" {
    ami             = "ami-02d55cb47e83a99a3"
    instance_type   = "t4g.nano"

    key_name        = aws_key_pair.deployer_key.key_name
    security_groups = [aws_security_group.ec2_security_group.name]

    tags {
        Name = "tf-neon-bot"
    }
}


resource "local_file" "private_key" {
    filename        = "./deployer-key.pem"
    content         = tls_private_key.ssh_key.private_key_pem
    file_permission = "0600"
}