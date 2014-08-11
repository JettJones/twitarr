class SeamailMessageDecorator < Draper::Decorator
  delegate_all

  def to_hash
    {
        id: id.to_s,
        author: author,
        text: text,
        timestamp: timestamp
    }
  end

end