if (localStorage.getItem("first") == null) {
    localStorage.setItem("per_page", 25);
    localStorage.setItem("order", "desc");
    localStorage.setItem("sort", "created");
    localStorage.setItem("filters", "is:open");
    localStorage.setItem("auth", null);
    localStorage.setItem("first", false);
}

let filter_list = localStorage.getItem("filters").split(",");

function toggleModal (id) {
    if (document.getElementById(id).style.display != "block") {
        document.getElementById(id).style.display = "block";
    } else {
        document.getElementById(id).style.display = "none";
    }
}

function addFilterInput () {
    document.getElementById("filter-list").innerHTML += `<div class="input-group">
        <label>filter ${document.getElementById("filter-list").children.length + 1}:</label>
        <input type="text" class="filter" />
        <input type="button" value="Remove" onclick="removeFilterInput(this)" />
    </div>`;
}

function showSettings () {
    document.getElementById("auth").value = localStorage.getItem("auth");
    document.getElementById("per_page").value = localStorage.getItem("per_page");
    document.getElementById("order").value = localStorage.getItem("order");
    switch (localStorage.getItem("order")) {
        case "asc":
            document.getElementById("order").value = "Ascending";
        case "desc":
            document.getElementById("order").value = "Descending";
    }
}

function removeFilterInput (el) {
    document.getElementById("filter-list").children.item(el).remove();
}

async function fetchjson (url) {
    if (localStorage.getItem("auth") != null) {
        return fetch(url, { headers: { authorization: "token " + localStorage.getItem("auth") } })
        .then((response) => {return response.json()});
    } else {
    return fetch(url)
        .then((response) => {return response.json()});
    }
}

async function main () {
    for (let k = 0; k < filter_list.length; k++) {
        let issues = await fetchjson("https://api.github.com/search/issues?per_page="+Math.floor(localStorage.getItem("per_page")/filter_list.length)+"&q="+filter_list[k]+"&order="+localStorage.getItem("order")+"&sort="+localStorage.getItem("sort"));
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
