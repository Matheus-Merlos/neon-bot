resource "aws_security_group" "ec2_security_group" {
  name        = "ec2-ssh-security-group"
  description = "Allows SSH access"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
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
    ami             = "ami-0789039e34e739d67"
    instance_type   = "t4g.nano"

    key_name        = "neon-bot-key-pair"
    security_groups = [aws_security_group.ec2_security_group.name]

    tags = {
        Name       = "tf-neon-bot"
        Auto-Start = true
        Backup     = true
    }
}

resource "aws_eip" "server_eip" {
  instance = aws_instance.main_server.id

  tags = {
    Name = "tf-neon-bot-server-ip"
  }
}
