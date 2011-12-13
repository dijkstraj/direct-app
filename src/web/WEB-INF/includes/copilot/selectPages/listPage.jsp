<%--
  - Author: TCSASSEMBLER
  - Version: 1.0
  - Copyright (C) 2011 TopCoder Inc., All Rights Reserved.
  -
  - Description: The list view of copilots.
  - Since: Release Assembly - TC Direct Select From Copilot Pool Assembly
  - Version 1.0 (Release Assembly - TC Direct Select From Copilot Pool Assembly).
--%>
<%@ page contentType="text/html;charset=UTF-8" language="java" %>
<%@ page import="com.topcoder.shared.util.ApplicationServer" %>
<%@ include file="/WEB-INF/includes/taglibs.jsp" %>
<div class="copilotListTable" style="display: block;">
    <table cellpadding="0" cellspacing="0">
        <colgroup>
            <col width="87" />
            <col width="100"/>
            <col width="100"/>
            <col width="100"/>
            <col width="100"/>
            <col width="112" />
            <col width="124" />
            <col width="124" />
            <col width="120" />
            
        </colgroup>
        <thead>
            <tr>
                <th class="first">
                    <input type="hidden" value="userHandleInput"></input>
                    Member
                </th>
                <th>
                    <input type="hidden" value="totalProjectsInput"></input>
                    # of Projects
                </th>
                <th>
                    <input type="hidden" value="totalContestsInput"></input>
                    # of Contest
                </th>
                <th>
                    <input type="hidden" value="repostContestsInput"></input>
                    # of Reposts
                </th>
                <th>
                    <input type="hidden" value="failureContestsInput"></input>
                    # of Failures
                </th>
                <th>
                    <input type="hidden" value="bugraceInput"></input>
                    # of Bug Races
                </th>
                <th>
                    <input type="hidden" value="currentProjectsInput"></input>
                    # of Current Projects
                </th>
                <th>
                    <input type="hidden" value="currentContestsInput"></input>
                    # of Current Contest
                </th>
                <th class="last">Action</th>
            </tr>
        </thead>
        
        <tbody>
            <c:forEach var="profile" items="${profiles}">
                <tr>
                    <td class="userLinkTD">
                        <input type="hidden" value="${profile.member.copilotProfile.handle}"></input>
                        <img src="${profile.photo.photoPath}" width="47" height="53" alt=""  />
                        <link:user userId="${profile.member.copilotProfile.userId}" handle="${profile.member.copilotProfile.handle}"/>
                    </td>
                    <td>${profile.member.totalProjects}</td>
                    <td>${profile.member.totalContests}</td>
                    <td>${profile.member.totalRepostedContests}</td>
                    <td>${profile.member.totalFailedContests}</td>
                    <td>${profile.member.totalBugRaces}</td>
                    <td class="custom greenText">${profile.member.currentProjects}</td>
                    <td class="custom greenText">${profile.member.currentContests}</td>
                    <td class="last">
                        <a href="javascript:;" class="blackButton selectCopilotList">Choose</a>
                        <input type="hidden" value="${profile.member.copilotProfile.userId}"></input>
                        <a href="http://<%=ApplicationServer.SERVER_NAME%>/tc?module=ViewCopilotProfile&pid=${profile.member.copilotProfile.userId}" class="blue">view profile</a>
                    </td>
                </tr>
            </c:forEach>    
            
        </tbody>
    </table>
</div>
<!--End .copilotList-->       