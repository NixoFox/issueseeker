let tempstore = {
    per_page: 5,
    filters: 'is:issue+is:open+label:enhancment,is:issue+is:open+label:"good first issue"'
};

let filter_list = tempstore.filters.split(",");

async function fetchjson (url) {
    return fetch(url)
        .then((response) => {return response.json()});
}

async function main () {
    for (let k = 0; k < filter_list.length; k++) {
        let issues = await fetchjson("https://api.github.com/search/issues?per_page="+Math.floor(tempstore.per_page/filter_list.length)+"&q="+filter_list[k]);
        let items = issues.items;
        for(let i = 0; i < items.length; i++) {
            let item = items[i];
            let user = "";
            let user_url = "";
            let repo = "";
            let repo_url = "";
            let lang = "";
            let repo_data = await fetchjson(item.repository_url);
            user = repo_data.owner.login;
            user_url = repo_data.owner.html_url;
            repo = repo_data.name;
            repo_url = repo_data.html_url;
            lang = repo_data.language;
            let repo_desc = repo_data.description;
            if (repo_desc === null) {
                repo_desc = "";
            }
            let title = item.title;
            let url = item.html_url;
            let labels = "";
            for (let j = 0; j < item.labels.length; j++) {
                labels += `<span>${item.labels[j].name}</span>\n`;
            }
            let element = `<div class="issue">
            <h3><a href="${user_url}">${user}</a>/<a href="${repo_url}">${repo}</a></h3>
            <h2><a href="${url}">${title}</a></h2>
            <span class="lang">${lang}</span>
            ${labels}
            <p>${repo_desc}</p>
            </div>`;
            document.getElementsByClassName("issues").item(0).innerHTML += element;
        }
    }
}

main();
