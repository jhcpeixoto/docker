import React, { useEffect, useState } from "react";
import { Message } from "fosscord.js";
import FlatList from "flatlist-react";
// import { Text } from "../../framework/Text";
import { TextChannel } from "fosscord.js";
import Drawer from "../../components/Drawer";
import { toHTML } from "discord-markdown";
import { relativeTime } from "../../util/Time";
// import { network } from "../../models/networks";
import client from "../../Client";
// import { useCache } from "../../util/useCache";
import "../../framework/tooltip.scss";
import "@fosscord/ui/scss/embed.scss";
import "./messages.scss";
import { useCache } from "../../util/useCache";

export default function Messages({ match }: any) {
  let channel = client.channels.resolve(match.params.channel);
  let guild = client.guilds.resolve(match.params.guild);

  useCache(client.guilds);
  useCache(client.channels);

  return (
    <Drawer channel={channel} guild={guild}>
      <div className="chatContent">
        <div className="scrolled-container">
          <RenderMessages channel={channel as TextChannel}></RenderMessages>
        </div>
      </div>
    </Drawer>
  );
}

function RenderMessages({ channel }: { channel: TextChannel }) {
  const [messages, setMessages] = useState<Message[]>(null);

  useCache(channel?.messages);

  useEffect(() => {
    channel?.messages
      ?.fetch()
      .then((msgs) =>
        setMessages(msgs.array().filter((x) => x.type === "DEFAULT"))
      );
  }, [channel]);

  if (!channel) return <></>;
  if (channel?.type !== "GUILD_TEXT") return <></>;

  //console.log(messages);

  return (
    <FlatList
      list={messages}
      sortBy={[{ key: "createdTimestamp", descending: true }]}
      renderItem={renderMessage}
    ></FlatList>
  );
}

export function renderMessage(item: Message, index: number, seperators: any) {
  const { id, author, member } = item;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { username, discriminator } = author;
  // const name = `${username}#${discriminator}`;
  const content = toHTML(escapeHTML(item.content), {
    discordCallback: {
      user: (user: any) => `<@${user.id}>`,
      role: (role: any) => `<@&${role.id}>`,
    },
    cssModuleNames: {
      "d-mention": "d-mention",
    },
  });

  console.log(item);

  return (
    <div key={id} className="message">
      <img
        src={item?.author?.avatarURL({ size: 1024 })}
        className="avatar"
        alt=""
      />
      <div className="contentMessage">
        <div className="messageHeader">
          <a
            href="/"
            className="text default"
            style={{ color: member?.displayHexColor }}
          >
            {username}
          </a>
          <span className="text muted">{relativeTime(item.createdAt)}</span>
        </div>
        <span
          className="text secondary"
          dangerouslySetInnerHTML={{
            __html: content,
          }}
        ></span>
        <span className="text secondary">
          {item.embeds && item.embeds.map((x: any) => <></>)}
        </span>

        {item.attachments &&
          item.attachments.map((x: any) => (
            <img
              style={{ height: x.height / 3, width: x.width / 3 }}
              alt="Test"
              className="attachments"
              src={x.url}
            />
          ))}
        {item.reactions && (
          <div>
            {item.reactions.cache?.map((x: any) => {
              return (
                <div>
                  <button>
                    <span>{x.emoji.id ? x.emoji.id : x.emoji.name}</span>
                  </button>
                  <span>{x.count}</span>
                </div>
              );
            })}
          </div>
        )}
        {item.embeds &&
          item.embeds.map((embed: any) => {
            return (
              <div className="embed">
                <div className="embed-primary-container">
                  <div className="embed-secondary-container">
                    {embed.author && (
                      <div className="embed-author">
                        <img
                          src={embed.author.url}
                          className="embed-author-iconUrl"
                          alt=""
                        />
                        <span className="embed-author-name">
                          {embed.author}
                        </span>
                      </div>
                    )}
                    {embed.title && (
                      <span className="embed-title">
                        {embed.url && (
                          <a href={embed.url} className="text link">
                            {embed.title}
                          </a>
                        )}
                        {!embed.url && (
                          <span className="text link">{embed.title}</span>
                        )}
                      </span>
                    )}
                    <span className="embed-description">
                      {embed.description}
                    </span>
                  </div>
                  {embed.thumbnail && (
                    <img
                      src={embed.thumbnail.url}
                      className="embed-thumpnail"
                      alt=""
                    />
                  )}
                </div>
                {embed.image && (
                  <img src={embed.image.url} className="embed-image" alt="" />
                )}
                {embed.footer && (
                  <div className="embed-footer">
                    {embed.footer.iconURL && (
                      <img
                        className="embed-footer-image"
                        src={embed.footer.iconURL}
                        alt=""
                      />
                    )}
                    <span className="embed-footer-text">
                      {embed.footer.text}
                    </span>
                    {embed.timestamp && (
                      <span className="embed-timestamp">{embed.timestamp}</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}

const escapeHTML = (text) => {
  text = text.replace(/&amp;/g, "&");
  text = text.replace(/&lt;/g, "<");
  text = text.replace(/&gt;/g, ">");
  text = text.replace(/&quot;/g, '"');
  return text;
};
