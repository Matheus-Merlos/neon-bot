resource "aws_iam_user" "dns_checker" {
    name = "dns-checker"

    lifecycle {
        ignore_changes = [ tags ]
    }
}

data "aws_iam_policy_document" "dns_checker_policy" {
  statement {
    effect = "Allow"
    actions = [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:PutObject"
    ]
    resources = [
        "arn:aws:s3:::tf-neon-bot-terraform-remote-state",
        "arn:aws:s3:::tf-neon-bot-terraform-remote-state/*"
    ]
  }

  statement {
    effect = "Allow"
    actions = [
        "ec2:DescribeInstances"
    ]
    resources = [ "*" ]
  }
}

resource "aws_iam_policy" "dns_checker_policy" {
  name   = "DNSChecker"
  policy = data.aws_iam_policy_document.dns_checker_policy.json
}

resource "aws_iam_user_policy_attachment" "dns_checker_attachment" {
  user       = aws_iam_user.dns_checker.name
  policy_arn = aws_iam_policy.dns_checker_policy.arn
}
